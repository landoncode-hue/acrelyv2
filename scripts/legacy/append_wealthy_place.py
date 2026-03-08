
import csv
import os

source_file = 'legacy-data/WEALTHY PLACE ESTATE_111635.csv'
target_file = 'scripts/database/migrations/migration/archive/legacy_data/data.csv'

def clean_currency(val):
    if not val:
        return 0.0
    # Remove quotes, commas, spaces
    val = val.replace('"', '').replace(',', '').strip()
    if not val:
        return 0.0
    try:
        return float(val)
    except ValueError:
        return 0.0

def format_currency(val):
    return str(int(val)) # Keeping it simple string integer as per example? Or float? 
                         # The example had "1,400,000" in quotes in source, but target likely needs number or clean string.
                         # Let's check target format later. Most CSVs standard imports use numbers. 
                         # Existing data.csv seems to use numbers or strings? 
                         # Grep output didn't show the values. 
                         # I'll output clean numbers (strings without commas) to be safe, or check existing format.
    
    # Actually, let's just return the standard string representation.

with open(source_file, 'r', encoding='utf-8') as f_in, open(target_file, 'a', newline='', encoding='utf-8') as f_out:
    reader = csv.reader(f_in)
    writer = csv.writer(f_out)
    
    headers = next(reader) # Skip header
    # Source Headers: DATE,CUSTOMER NAME,PLOT SIZE,PLOT NO, BEACON NO,PAYMENT,BALANCE,PHONE NUMBER,REFERED BY,AMOUNT PAID,ADDRESS,CODE
    # Indices: 0:Date, 1:Name, 2:Size, 3:PlotNo, 4:Beacon, 5:Payment, 6:Balance, 7:Phone, 8:Ref, 9:AmtPaid, 10:Addr, 11:Code
    
    # Target Headers: Estate Name,Date,Customer Name,Plot Size,Plot No,Plot Count,Amount Paid (N),Balance (N),Total Contract Value (N),Est Unrecorded Debt (N),Payment Status,Phone Number,Address,Referral

    estate_name = "WEALTHY PLACE ESTATE"

    for row in reader:
        # Check if row is empty or just commas
        if not any(row):
            continue
        
        # Extract and map
        date = row[0]
        name = row[1]
        if not name: continue # Skip empty rows

        size = row[2]
        plot_no = row[3]
        if row[4]:
            plot_no += f" {row[4]}" # Append Beacon No if exists
        
        plot_count = 1 # Default
        
        paiement_str = row[5]
        balance_str = row[6]
        
        paid = clean_currency(paiement_str)
        balance = clean_currency(balance_str)
        total = paid + balance
        
        est_debt = 0
        
        status = "Paid" if balance <= 0 else "Incomplete" # Simple logic
        
        phone = row[7]
        referral = row[8]
        # Skip row[9] Amount Paid? it seemed empty
        address = row[10] if len(row) > 10 else ""
        
        # Write to target
        writer.writerow([
            estate_name,
            date,
            name,
            size,
            plot_no,
            plot_count,
            paid,
            balance,
            total,
            est_debt,
            status,
            phone,
            address,
            referral
        ])

print("Finished appending WEALTHY PLACE ESTATE.")
