import pandas as pd
import glob
import os
import re

# Output file
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), 'archive', 'legacy_data', 'data.csv')

# Column Mappings (Target -> [Possible Source Headers])
COLUMN_MAP = {
    'customer_name': ['CUSTOMER NAME', 'NAME', 'CLIENT NAME', 'FULL NAME', 'NAME OF CLIENT'],
    'phone_number': ['PHONE NUMBER', 'PHONE NO', 'PHONE', 'MOBILE', 'CONTACT'],
    'estate_name': [], # Will infer from filename or column if exists
    'plot_number': ['PLOT NO', 'PLOT NUMBER', 'PLOT', 'BLOCK/PLOT'],
    'price': ['PRICE', 'TOTAL COST', 'TOTAL PRICE', 'AMOUNT', 'PLOT VALUE'],
    'amount_paid': ['PAYMENT', 'AMOUNT PAID', 'TOTAL PAID', 'DEPOSIT'],
    'legacy_referrer': ['REFFERAL', 'REFERRAL', 'AGENT', 'REFERER', 'Marketer'],
    'date': ['DATE', 'DATE OF PAYMENT']
}

def normalize_header(header):
    if not isinstance(header, str): return str(header)
    return header.strip().upper()

def find_column(df, target_key):
    """Finds the actual column name in df that matches our target key aliases."""
    possible_names = COLUMN_MAP.get(target_key, [])
    for col in df.columns:
        if normalize_header(col) in possible_names:
            return col
    return None

def clean_phone(phone):
    if pd.isna(phone): return None
    s = str(phone).split('.')[0] # Remove .0 from floats
    s = re.sub(r'\D', '', s) # Remove non-digits
    if s.startswith('234'): s = '+' + s
    elif s.startswith('0'): s = '+234' + s[1:]
    elif len(s) == 10: s = '+234' + s # Assume missing 0
    return s

def clean_money(val):
    if pd.isna(val) or val == '': return 0
    s = str(val).replace(',', '').replace('N', '').strip()
    try:
        return float(s)
    except:
        return 0

def clean_plot(val):
    if pd.isna(val): return ''
    return str(val).strip()

all_data = []

files = glob.glob(os.path.join(os.path.dirname(__file__), 'archive', 'legacy_data', '*.xlsx'))
print(f"Found {len(files)} Excel files.")

for f in files:
    try:
        # Determine Estate Name from Filename
        basename = os.path.basename(f).replace('.xlsx', '')
        # Basic cleanup of filename to estate name
        estate_name = basename.replace('ESTATE', '').strip() + ' ESTATE' 
        # Manual overrides for known filename quirks
        if 'OSE PERFECTION' in basename: estate_name = 'OSE PERFECTION GARDEN ESTATE' 
        
        print(f"Processing {f} -> Estate: {estate_name}")
        
        df = pd.read_excel(f)
        
        # Map Columns
        col_name = find_column(df, 'customer_name')
        col_phone = find_column(df, 'phone_number')
        col_plot = find_column(df, 'plot_number')
        col_price = find_column(df, 'price')
        col_paid = find_column(df, 'amount_paid')
        col_ref = find_column(df, 'legacy_referrer')
        col_date = find_column(df, 'date')

        if not col_name:
            print(f"  [WARN] Skipping {f}: No 'Customer Name' column found.")
            continue

        for _, row in df.iterrows():
            # Extract
            name = row[col_name] if col_name else None
            if pd.isna(name): continue # Skip empty rows

            phone = clean_phone(row[col_phone]) if col_phone else None
            plot = clean_plot(row[col_plot]) if col_plot else f"UNKNOWN-{_}" # Fallback
            price = clean_money(row[col_price]) if col_price else 0
            paid = clean_money(row[col_paid]) if col_paid else 0
            referrer = row[col_ref] if col_ref else ''
            
            # Date Handling
            date_val = row[col_date] if col_date else None
            try:
                if pd.notna(date_val):
                    date_str = pd.to_datetime(date_val).strftime('%Y-%m-%d')
                else:
                    date_str = '2024-01-01' # Fallback
            except:
                date_str = '2024-01-01'

            all_data.append({
                'customer_name': name,
                'phone_number': phone,
                'estate_name': estate_name,
                'plot_number': plot,
                'price': price,
                'amount_paid': paid,
                'legacy_referrer': referrer,
                'date': date_str
            })

    except Exception as e:
        print(f"  [ERROR] Failed to process {f}: {e}")

# Output
final_df = pd.DataFrame(all_data)
final_df = final_df.dropna(subset=['customer_name']) # Ensure name exists

# Basic Deduplication? Maybe same customer bought multiple plots? Keep them.

print(f"Generated {len(final_df)} records.")
final_df.to_csv(OUTPUT_FILE, index=False)
print(f"Saved to {OUTPUT_FILE}")
