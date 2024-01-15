import pandas as pd

##Create a time comparison dataframe for county executive elections

# Read the CSV file
df = pd.read_csv('data/ledb_candidatelevel.csv')

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
num_seats_list = []

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
result_df.to_csv('data/county-executive-map-data-year.csv', index=False)

# Read the CSV file with selected county constituency data
selected_columns = ['fips', 'percent_women']
fips_df = pd.read_csv('data/counties_constituency_data1.csv', encoding='latin-1', usecols=selected_columns)

# Convert 'fips' column in fips_df to int64
fips_df['fips'] = fips_df['fips'].astype('int64')

# Apply zfill to 4-digit 'fips' code
fips_df['fips'] = fips_df['fips'].astype(str).str.zfill(5)

# Merge the dataframes on 'fips'
merged_df = pd.merge(result_df, fips_df, on='fips')

#Create the female_representation variable
merged_df['female_representation'] = merged_df['f_winner'] / merged_df['percent_women']

#Create the representation score on a 0-1 binary
merged_df['f_representation_score'] = (merged_df['female_representation'] * .5).round().astype(int)

# Save the updated DataFrame to a CSV file
merged_df.to_csv('data/county-executive-map-data-year.csv', index=False)