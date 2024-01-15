import pandas as pd

# Read the CSV file
df = pd.read_csv('ledb_candidatelevel.csv')

# Filter the data for "County Legislature" office
df_county_legislator = df[df['office_consolidated'] == 'County Legislature']

# Initialize empty lists to store results
fips_list = []
geo_name_list = []
num_m_list = []
num_f_list = []
f_winner_list = []
m_winner_list = []
num_seats_list = []

# Group by 'fips' and iterate through the groups
for fips, group in df_county_legislator.groupby('fips'):
    padded_fips = str(fips).zfill(5)
    fips_list.append(fips)
    geo_name_list.append(group['geo_name'].iloc[0])  # Take the first value of 'geo_name'
    
    # Check for NaN values in 'gender_est' column and sum up the values for each 'fips' group
    num_m_list.append(group['gender_est'].apply(lambda x: str(x).count('M') if isinstance(x, str) else 0).sum())
    num_f_list.append(group['gender_est'].apply(lambda x: str(x).count('F') if isinstance(x, str) else 0).sum())
    
    # Check for NaN values in 'gender_est' and 'winner' columns
    f_winner = ((group['gender_est'] == 'F') & (group['winner'] == 'win')).sum() if 'gender_est' in group.columns and 'winner' in group.columns else 0
    m_winner = ((group['gender_est'] == 'M') & (group['winner'] == 'win')).sum() if 'gender_est' in group.columns and 'winner' in group.columns else 0
    
    # Append the calculated values to the lists
    f_winner_list.append(f_winner)
    m_winner_list.append(m_winner)
    
    # Add male and female winners to count the total number of available seats
    if f_winner is not None and m_winner is not None:
        num_seats_list.append(f_winner + m_winner)
    else:
        num_seats_list.append(0)

# Ensure all lists have the same length
length = min(len(fips_list), len(geo_name_list), len(num_m_list), len(num_f_list), len(f_winner_list), len(m_winner_list), len(num_seats_list))

# Create a new DataFrame with the aggregated results
result_df = pd.DataFrame({
    'fips': fips_list,
    'geoname': geo_name_list,
    'num_M': num_m_list,
    'num_F': num_f_list,
    'f_winner': f_winner_list,
    'm_winner': m_winner_list,
    'num_seats': num_seats_list
})

# Save the new DataFrame to a CSV file
result_df.to_csv('county-legislator-map-data.csv', index=False)

# Read the CSV file with selected county constituency data
selected_columns = ['fips', 'percent_women']
fips_df = pd.read_csv('counties_constituency_data1.csv', encoding='latin-1', usecols=selected_columns)

# Convert 'fips' column in fips_df to int64
fips_df['fips'] = fips_df['fips'].astype('int64')

# Apply zfill to 4-digit 'fips' code
fips_df['fips'] = fips_df['fips'].astype(str).str.zfill(5)

# Merge the dataframes on 'fips'
merged_df = pd.merge(result_df, fips_df, on='fips')

#Create the female_representation variable
merged_df['female_representation'] = (merged_df['f_winner'] / merged_df['num_seats']) / merged_df['percent_women']
merged_df['female_representation'].fillna(0, inplace=True)

#Create the representation score on a 10-point scale, where 5 = parity representation, 10 = full female overrepresentation, and 0= full female underrepresentation
merged_df['f_representation_score'] = (merged_df['female_representation'] * 5).round().astype(int)

# Save the updated DataFrame to a CSV file
merged_df.to_csv('county-legislator-map-data.csv', index=False)