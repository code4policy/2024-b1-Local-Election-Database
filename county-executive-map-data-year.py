import pandas as pd

##Create a time comparison dataframe for county executive elections

# Read the CSV file
df = pd.read_csv('ledb_candidatelevel.csv')

# Filter the data for "County Executive" office
df_county_executive = df[df['office_consolidated'] == 'County Executive']

# Initialize empty lists to store results
fips = []
geo_name =[]
year_list =[]
num_m_list = []
num_f_list = []
office_consolidated = []
f_winner = []
m_winner = []

# Iterate through the grouped data to extract information
for _, row in df_county_executive.iterrows():
    padded_fips = str(fips).zfill(5)
    fips.append(row['fips'])
    year_list.append(row['year'])
    office_consolidated.append(row['office_consolidated'])
    geo_name.append(row['geo_name'])

# Check for NaN values in 'gender_est' column
    if isinstance(row['gender_est'], str):
        num_m_list.append(row['gender_est'].count('M'))
        num_f_list.append(row['gender_est'].count('F'))
    else:
        # Handle NaN values
        num_m_list.append(0)
        num_f_list.append(0)

## Check for NaN values in 'winner column'
    if isinstance(row['winner'], str):
        f_winner.append(int((row['gender_est'] == 'F') & (row['winner'] == 'win')))
        m_winner.append(int((row['gender_est'] == 'M') & (row['winner'] == 'win')))
    else:
        # Handle NaN values
        f_winner.append(0)
        m_winner.append(0)

# Create a new DataFrame with the results
result_df = pd.DataFrame({
    'office_consolidated': office_consolidated,
    'fips': fips,
    'geo_name': geo_name,
    'year': year_list,
    'num_M': num_m_list,
    'num_F': num_f_list,
    #Add new columns for male and female winners
    'f_winner': f_winner,
    'm_winner': m_winner
})

# Save the new DataFrame to a CSV file
result_df.to_csv('county-executive-map-data-year.csv', index=False)