import pandas as pd

# Read the CSV file
df = pd.read_csv('ledb_candidatelevel.csv')

# Filter the data for "County Executive" office
df_county_executive = df[df['office_consolidated'] == 'County Executive']

# Initialize empty lists to store results
fips = []
year_list =[]
num_m_list = []
num_f_list = []

# Iterate through the grouped data to extract information
for _, row in df.iterrows():
    fips.append(row['fips'])
    year_list.append(row['year'])

# Check for NaN values in 'gender_est' column
    if isinstance(row['gender_est'], str):
        num_m_list.append(row['gender_est'].count('M'))
        num_f_list.append(row['gender_est'].count('F'))
    else:
        # Handle NaN values, you can choose to set them to 0 or any other value
        num_m_list.append(0)
        num_f_list.append(0)

# Create a new DataFrame with the results
result_df = pd.DataFrame({
    'fips': fips,
    'year': year_list,
    'num_M': num_m_list,
    'num_F': num_f_list
})

# Save the new DataFrame to a CSV file
result_df.to_csv('county-executive-map-data.csv', index=False)
