import os
import shutil
import psycopg2
import pandas as pd
import json
from dotenv import load_dotenv

# Load database credentials from environment variables
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../docker/.env"))
load_dotenv(env_path)

DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")

# Ingest and archive file paths
INGEST_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "../csv_files/ingest/"))
ARCHIVE_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "../csv_files/archive/"))
OUTPUT_JSON = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/assets/data/processed.json"))

# Performances table name
TABLE_NAME = "performances"

# Performances table primary key columns
PRIMARY_KEY_COLUMNS = ["Date", "Competition", "Round", "High School"]

# Categories list
CATEGORIES = [
    "Music Performance Individual",
    "Music Performance Ensemble",  
    "Music Performance Average",
    "Visual Performance Individual",
    "Visual Performance Ensemble",
    "Visual Performance Average",
    "General Effect Music 1",
    "General Effect Music 2",
    "General Effect Music Total",
    "General Effect Visual",
    "General Effect Total"
];

TYPE_MAPPING = {
    "int64": "INTEGER",
    "float64": "REAL",
    "object": "TEXT",
    "bool": "BOOLEAN",
    "datetime64": "TIMESTAMP"
}

# Function to connect to PostgreSQL
def get_db_connection():
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error: Unable to connect to database\n{e}")
        return None

# Function to check if performances table exists
def table_exists():
    conn = get_db_connection()
    if not conn:
        return False

    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = '{TABLE_NAME}'
            );
        """)
        return cur.fetchone()[0]
    
    finally:
        cur.close()
        conn.close()

# Function to create performances table
def create_table(df):
    conn = get_db_connection()
    if not conn:
        return

    try:
        cur = conn.cursor()

        missing_columns = [col for col in PRIMARY_KEY_COLUMNS if col not in df.columns]
        if missing_columns:
            print(f"Error: Missing required columns for primary key: {missing_columns}")
            return

        column_types = {col: TYPE_MAPPING.get(str(df[col].dtype), "TEXT") for col in df.columns}

        column_types["Class Number"] = "INTEGER"
        column_types["Final Round"] = "TEXT"

        for category in CATEGORIES:
            column_types[f"{category} Rank"] = "INTEGER"
            column_types[f"{category} Z-Score"] = "REAL"
            column_types[f"{category} Class Rank"] = "INTEGER"
            column_types[f"{category} Class Z-Score"] = "REAL"

        columns_sql = ", ".join([f'"{col}" {col_type}' for col, col_type in column_types.items()])
        primary_key_sql = ", ".join([f'"{col}"' for col in PRIMARY_KEY_COLUMNS])

        create_table_sql = f"""
            CREATE TABLE "{TABLE_NAME}" (
                {columns_sql},
                PRIMARY KEY ({primary_key_sql})
            );
        """

        cur.execute(create_table_sql)
        conn.commit()

    finally:
        cur.close()
        conn.close()

# Function to get performances table columns
def get_columns():
    conn = get_db_connection()
    if not conn:
        return []

    try:
        cur = conn.cursor()
        cur.execute(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = '{TABLE_NAME}';
        """)
        return [row[0] for row in cur.fetchall()]
    
    finally:
        cur.close()
        conn.close()

def alter_table(df):
    conn = get_db_connection()
    if not conn:
        return

    try:
        cur = conn.cursor()
        existing_columns = get_columns()
        new_columns = [col for col in df.columns if col not in existing_columns]

        if new_columns:
            alter_sql = ", ".join([f'ADD COLUMN "{col}" {TYPE_MAPPING.get(str(df[col].dtype), "TEXT")}' for col in new_columns])
            cur.execute(f'ALTER TABLE "{TABLE_NAME}" {alter_sql};')

        conn.commit()
    
    finally:
        cur.close()
        conn.close()

# Helper to convert Pandas NA to Python None
def convert_val(x):
    if pd.isna(x):
        return None
    if hasattr(x, "item"):
        return x.item()
    return x

# Function to insert data into performances table
def insert_data(df):
    conn = get_db_connection()
    if not conn:
        return

    try:
        cur = conn.cursor()

        cur.execute(f"""
            SELECT column_name FROM information_schema.columns
            WHERE table_name = '{TABLE_NAME}';
        """)

        missing_columns = [col for col in PRIMARY_KEY_COLUMNS if col not in df.columns]
        if missing_columns:
            print(f"Error: Missing required columns for primary key: {missing_columns}")
            return

        alter_table(df)
        db_columns = get_columns()

        def compute_class_number(class_value):
            if pd.isna(class_value) or class_value is None:
                return None
            class_str = str(class_value).strip()
            numeric_part = ''.join(filter(str.isdigit, class_str))
            if numeric_part:
                return int(numeric_part)
            if "A" in class_str:
                return class_str.count("A")
            return None

        if "Class" in df.columns:
            df["Class Number"] = df["Class"].apply(compute_class_number)
            df["Class Number"] = df["Class Number"].astype(object).where(df["Class Number"].notna(), None)
        else:
            df["Class Number"] = None

        df["Year"] = pd.to_datetime(df["Date"]).dt.year
        missing_class_mask = (df["Round"] != "Prelims") & (df["Class"].isna())
        for index, row in df[missing_class_mask].iterrows():
            match = df[
                (df["Year"] == row["Year"]) &
                (df["Competition"] == row["Competition"]) &
                (df["High School"] == row["High School"]) &
                (df["Round"] == "Prelims")
            ]
            if not match.empty:
                df.at[index, "Class Number"] = match["Class Number"].values[0]

        df["Class Number"] = pd.to_numeric(df["Class Number"], errors='coerce').astype("Int64")
        missing_rank_mask = df["Class Rank"].isna() & df["Class Number"].notna()
        df.loc[missing_rank_mask, "Class Rank"] = df.groupby(
            ["Date", "Competition", "Round", "Class Number"]
        )["Class Number"].rank(method="min", ascending=False).astype("Int64")
        df["Class Rank"] = df["Class Rank"].where(df["Class Rank"].notna(), None)

        def get_final_round(group):
            if "Finals" in group.values:
                return "Finals"
            elif "Semifinals" in group.values:
                return "Semifinals"
            else:
                return "Prelims"

        df["Final Round"] = df.groupby(["Year", "Competition", "High School"])["Round"].transform(get_final_round)
        df.drop(columns=["Year"], inplace=True)

        def compute_rank_and_zscore(df, category_name):
            if category_name in df.columns:
                rank_col = f"{category_name} Rank"
                zscore_col = f"{category_name} Z-Score"
                df[rank_col] = df.groupby(["Date", "Competition", "Round"])[category_name] \
                    .rank(method="min", ascending=False).astype("Int64")
                df[zscore_col] = df.groupby(["Date", "Competition", "Round"])[category_name] \
                    .transform(lambda x: (x - x.mean()) / x.std(ddof=1) if x.count() > 1 and x.std(ddof=1) != 0 else 0)
            else:
                df[f"{category_name} Rank"] = None
                df[f"{category_name} Z-Score"] = None

        def compute_class_rank_and_zscore(df, category_name):
            if category_name in df.columns:
                rank_col = f"{category_name} Class Rank"
                zscore_col = f"{category_name} Class Z-Score"
                df[rank_col] = df.groupby(["Date", "Competition", "Round", "Class Number"])[category_name] \
                    .rank(method="min", ascending=False).astype("Int64")
                df[zscore_col] = df.groupby(["Date", "Competition", "Round", "Class Number"])[category_name] \
                    .transform(lambda x: (x - x.mean()) / x.std(ddof=1) if x.count() > 1 and x.std(ddof=1) != 0 else 0)
            else:
                df[f"{category_name} Rank"] = None
                df[f"{category_name} Z-Score"] = None

        for category in CATEGORIES:
            compute_rank_and_zscore(df, category)
            compute_class_rank_and_zscore(df, category)

        for col in db_columns:
            if col not in df.columns:
                df[col] = None

        df = df.reindex(columns=db_columns)
       
        columns_sql = ", ".join([f'"{col}"' for col in db_columns])
        values_sql = ", ".join(["%s"] * len(db_columns))
        primary_key_sql = ", ".join([f'"{col}"' for col in PRIMARY_KEY_COLUMNS])
        update_sql = ", ".join([f'"{col}" = EXCLUDED."{col}"' for col in db_columns if col not in PRIMARY_KEY_COLUMNS])

        insert_sql = f"""
        INSERT INTO "{TABLE_NAME}" ({columns_sql}) 
        VALUES ({values_sql}) 
        ON CONFLICT ({primary_key_sql}) 
        DO UPDATE SET {update_sql};
        """

        # Use convert_val to ensure Pandas NA (and other NumPy scalars) become Python None
        for _, row in df.iterrows():
            cur.execute(insert_sql, tuple(convert_val(x) for x in row))

        conn.commit()

    finally:
        cur.close()
        conn.close()

# Function to process csv files in ingest folder
def process_csv_files(drop_table_flag=False):
    if drop_table_flag:
        drop_table()

    if not os.path.exists(INGEST_FOLDER):
        os.makedirs(INGEST_FOLDER)
        print(f"Created folder: {INGEST_FOLDER}")

    if not os.path.exists(ARCHIVE_FOLDER):
        os.makedirs(ARCHIVE_FOLDER)
        print(f"Created folder: {ARCHIVE_FOLDER}")

    csv_files = [f for f in os.listdir(INGEST_FOLDER) if f.endswith(".csv")]
    if not csv_files:
        print("No new CSV files to process.")
        return

    for file in csv_files:
        file_path = os.path.join(INGEST_FOLDER, file)
        print(f"Processing file: {file} from ingest folder.")

        df = pd.read_csv(file_path)
        df = df.where(pd.notna(df), None)

        if not table_exists():
            create_table(df)

        insert_data(df)

        shutil.move(file_path, os.path.join(ARCHIVE_FOLDER, file))
        print(f"Moved file: {file} to archive folder.")

    export_json()

# Function to export PostgreSQL data to JSON
def export_json():
    conn = get_db_connection()
    if not conn:
        return

    try:
        df = pd.read_sql(f'SELECT * FROM "{TABLE_NAME}";', conn)

        if df.empty:
            print("No data available in performances table. JSON export skipped.")
            return

        df.to_json(OUTPUT_JSON, orient="records", indent=4)
        print(f"Data exported to {OUTPUT_JSON}")

    finally:
        conn.close()

# Function to drop performances table
def drop_table():
    conn = get_db_connection()
    if not conn:
        return

    try:
        cur = conn.cursor()
        if table_exists():
            cur.execute(f'DROP TABLE "{TABLE_NAME}";')
            conn.commit()
            print(f"Table '{TABLE_NAME}' deleted successfully.")
        else:
            print(f"Table '{TABLE_NAME}' does not exist. Table drop skipped.")
    
    finally:
        cur.close()
        conn.close()

# Run function to process csv files
if __name__ == "__main__":
    process_csv_files(drop_table_flag=False)




