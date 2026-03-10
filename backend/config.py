import pyodbc
import mysql.connector

def get_sqlserver_connection():
    try:
        conn = pyodbc.connect(
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=PHUOCTAN\\MSSQLSERVER07;"        
            "DATABASE=HUMAN;"          
            "UID=sa;"                 
            "PWD=123456;",             
            timeout=5
        )
        return conn

    except Exception as e:
        print("Lỗi kết nối SQL Server:", str(e))
        raise


def get_mysql_connection():
    try:
        conn = mysql.connector.connect(
            port = 3307,
            host="localhost",
            user="root",
            password="123456",
            database="PAYROLL",
            autocommit=False   
        )
        return conn

    except Exception as e:
        print("Lỗi kết nối MySQL:", str(e))
        raise