from tableauhyperapi import HyperProcess, Telemetry, Connection, CreateMode, \
    NOT_NULLABLE, NULLABLE, SqlType, TableDefinition, Inserter, \
    escape_name, escape_string_literal, HyperException, TableName
from datetime import datetime

# Note: You'll need the tableauhyperapi library installed
# pip install tableauhyperapi

def generate_hyper_file():
    print("Generating .hyper file...")
    path_to_database = "player_churn_predictions.hyper"

    # Define the table definition
    customer_table = TableDefinition(
        # Name the table "Predictions"
        table_name=TableName("Extract", "Predictions"),
        columns=[
            TableDefinition.Column(name="PlayerID", type=SqlType.text(), nullability=NOT_NULLABLE),
            TableDefinition.Column(name="ChurnProbability", type=SqlType.double(), nullability=NOT_NULLABLE),
            TableDefinition.Column(name="PredictedSegment", type=SqlType.text(), nullability=NULLABLE),
            TableDefinition.Column(name="LastLoginDate", type=SqlType.date(), nullability=NULLABLE)
        ]
    )

    try:
        # Start the Hyper process
        with HyperProcess(telemetry=Telemetry.SEND_USAGE_DATA_TO_TABLEAU) as hyper:
            # Open a connection to the Hyper file
            with Connection(endpoint=hyper.endpoint,
                            database=path_to_database,
                            create_mode=CreateMode.CREATE_AND_REPLACE) as connection:
                
                # Create the schema and table
                connection.catalog.create_schema(schema=customer_table.table_name.schema_name)
                connection.catalog.create_table(table_definition=customer_table)

                # Insert data
                rows_to_insert = [
                    ["player_1", 0.12, "High Value", datetime.strptime("2023-10-25", "%Y-%m-%d").date()],
                    ["player_2", 0.85, "At Risk", datetime.strptime("2023-10-10", "%Y-%m-%d").date()],
                    ["player_3", 0.05, "Loyal", datetime.strptime("2023-10-26", "%Y-%m-%d").date()]
                ]
                
                with Inserter(connection, customer_table) as inserter:
                    inserter.add_rows(rows_to_insert)
                    inserter.execute()
                    
        print("Hyper file created successfully!")

    except HyperException as ex:
        print(f"Error creating Hyper file: {ex}")

if __name__ == "__main__":
    generate_hyper_file()
