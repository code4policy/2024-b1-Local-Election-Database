import pandas as pd
from scipy.stats import chisquare

# Load your data file
data = pd.read_csv('county-executive.csv', delimiter='\t')

# Group the data by 'fips' and 'gender_est' and count the occurrences
gender_counts = data.groupby(['fips', 'gender_est']).size().unstack(fill_value=0)

# Rename columns for clarity if needed
gender_counts.columns = ['FemaleCount', 'MaleCount']

# Now, define the 'gender_counts_by_fips' DataFrame by resetting the index to make 'fips' a column
gender_counts_by_fips = gender_counts.reset_index()

# Add a column for the total count of winners per FIPS code
gender_counts_by_fips['TotalCount'] = gender_counts_by_fips['FemaleCount'] + gender_counts_by_fips['MaleCount']

# Group the data by 'fips' and collect the sorted list of years into a new column
years_by_fips = data.groupby('fips')['year'].apply(lambda x: sorted(list(x))).reset_index()
gender_counts_by_fips = gender_counts_by_fips.merge(years_by_fips, on='fips', how='left')

# Function to apply the Chi-Square Goodness of Fit Test for each row (FIPS code)
def perform_chi_square(row):
    observed = [row['FemaleCount'], row['MaleCount']]
    expected = [row['TotalCount'] / 2, row['TotalCount'] / 2]  # Expected counts if the ratio is 1:1
    chi2_stat, p_val = chisquare(observed, f_exp=expected)
    return pd.Series([chi2_stat, p_val], index=['ChiSquareStatistic', 'P-Value'])

# Apply the function across the rows
chi_square_results = gender_counts_by_fips.apply(perform_chi_square, axis=1)

# Combine the Chi-Square results with the gender count data
combined_results = pd.concat([gender_counts_by_fips, chi_square_results], axis=1)

# Add a column to indicate if the p-value is lower than 0.05
combined_results['Representation'] = combined_results['P-Value'].apply(
    lambda p: 'Low Gender Representation' if p < 0.05 else 'Low Gender Representation not Detected'
)

# Add a column for Female Representation Value (FemaleCount / TotalCount)
combined_results['FemaleRepresentation'] = combined_results['FemaleCount'] / combined_results['TotalCount']

# Calculate the Representation Score on a scale of 10
combined_results['FemaleRepresentationScore'] = (combined_results['FemaleRepresentation'] * 10).round().astype(int)

# Rename the 'year' column to 'Years' for clarity
combined_results.rename(columns={'year': 'Years'}, inplace=True)

# Save the results to a CSV file
output_filepath_chi_square = 'chi_square_results_with_female_representation_score_by_fips.csv'
combined_results.to_csv(output_filepath_chi_square, index=False)
