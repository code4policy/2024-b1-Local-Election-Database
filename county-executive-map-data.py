import pandas as pd

# Read the CSV file
df = pd.read_csv('ledb_candidatelevel.csv')

# Filter the data for "County Executive" office
df_county_executive = df[df['office_consolidated'] == 'County Executive']

# Initialize empty lists to store results
fips_list = []
geo_name_list = []
num_m_list = []
num_f_list = []
f_winner_list = []
m_winner_list = []
num_elections_list = []

# Group by 'fips' and iterate through the groups
for fips, group in df_county_executive.groupby('fips'):
    padded_fips = str(fips).zfill(5)
    fips_list.append(fips)
    geo_name_list.append(group['geo_name'].iloc[0])  # Take the first value of 'geo_name'
    
    # Check for NaN values in 'gender_est' column and sum up the values for each 'fips' group
    num_m_list.append(group['gender_est'].apply(lambda x: str(x).count('M') if isinstance(x, str) else 0).sum())
    num_f_list.append(group['gender_est'].apply(lambda x: str(x).count('F') if isinstance(x, str) else 0).sum())
    
    # Check for NaN values in 'gender_est' and 'winner' columns
    f_winner_list.append(((group['gender_est'] == 'F') & (group['winner'] == 'win')).sum() if 'gender_est' in group.columns and 'winner' in group.columns else 0)
    m_winner_list.append(((group['gender_est'] == 'M') & (group['winner'] == 'win')).sum() if 'gender_est' in group.columns and 'winner' in group.columns else 0)
    
    # Count unique years for the 'fips' group
    num_elections_list.append(group['year'].nunique())

# Create a new DataFrame with the aggregated results
result_df = pd.DataFrame({
    'fips': fips_list,
    'geoname': geo_name_list,
    'num_M': num_m_list,
    'num_F': num_f_list,
    'f_winner': f_winner_list,
    'm_winner': m_winner_list,
    'num_elections': num_elections_list
})

# Save the new DataFrame to a CSV file
result_df.to_csv('county-executive-map-data.csv', index=False)