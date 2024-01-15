# b1-Local-Election-Database

## Introduction

Welcome to the GitHub repository for the Local Elections Database group! This team was brought together in January 2024 by Programming and Data for Policymakers, a course at the Harvard Kennedy School. Professors [Dhrumil Mehta] (https://dhrumilmehta.com) and [Aarushi Sahejpal] (https://aarushisahejpal.com) tasked us with using our new skills in programming to create a useful, helpful website. You can [view our website online here] (https://code4policy.com/2024-b1-Local-Election-Database/index.html).

With a shared background in public service and passion for democracy and representation, we decided to bring the ground-breaking [American Local Government Elections Database] (https://osf.io/mv5e6/) to life. Prior to this project, the database existed as a working paper and a set of spreadsheets. We decided to visualize and reformat these data to help answer the question: do local governments in the U.S. represent everyone?

Team members include Brandon Martinez, Kazi Ahmed, Kimihiro Nakamura, and Sarah Grucza. You can [learn more about our team here] (https://code4policy.com/2024-b1-Local-Election-Database/index.html).

## Replicating the Score Visualizations

The maps that display representation on a 10-point scale (e.g. "Heading of Scoring Map on gender-web-page") are for activists and organization leaders that would like a ready-made heuristic for governmental entities that represent social groups like women less than their share of the population. By applying a scalar rating system to the degree of descriptive representation in a community, we aim to give these users a clear way to identify communities that are similar to each other, as well as others that are markedly unrepresentative.

To recreate the data we utilized, take the following steps: 

1. Download ledb_candidadatelevel.csv. This file contains original data from the [American Local Government Elections Database] (https://osf.io/mv5e6/).

2. Run the program county-executive-map-data.py on your device. This program uses the FIPS code to create a data frame of aggregated elections by county with the number of men and women who ran for office, the number that won, and the total number of seats available. 

3. The program also creates the file county-executive-map-data.csv, a version of which you can download directly from our GitHub repository.

4. The program also merges the data with a file with data on the proportion of women per county. That file, counties_constituency_data1.csv, is another original dataset from the [American Local Government Elections Database] (https://osf.io/mv5e6/), and it is also available for download from this repository.

5. Finally, the program also creates a representation variable: the number of female winners over the percentage of women in the population. We transformed this value into a representation score by multiplying each value (which was in the range {0,1}) by 10. 

## Replicating the Chi-square Visualization

We also displayed representation as a statistical value using the Chi-square statistical test. The Chi-sqaure test examines the differences between categorical variables from a random sample in order to judge the goodness of fit between expected and observed results. Some counties, statistically speaking, should be more and less representative than an expected 1:1 representation between a community population and the proportion of representatives from that social group. The Chi-square test helps researchers identify outlier counties with statistically anomalous levels of representation.

To recreate the data we utilized, take the following steps for county executive election: 

1. Download county-executive.csv from the "gender-web-page" folder. This is a modified dataset of ledb_candidatelevel.csv with fips codes, year of election, and the estimated gender value, value or female, of the elected representatives.

2. Run the program gender-count-chisquare-with-female-representation-score.py. This program created a data frame that created columns for the total count of winners per FIPS code. 

3. The program applies the Chi-Sqaure Goodness of Fit Test for each row of data, combines the results with the gender count data, and adds a p-value score to indicate whether the difference in representation is statistically significant. These results populate a file called chi_square_results_with_female_representation_score_by_fips.csv. This file is also within the "gender-web-page" folder in the repository.

4. Files in the folder can reproduce the map visualizations you see on the "By Gender" page of the website.

For county legislature election, go to the "gender-web-page-by-county-leg" folder, replace the files in above steps county-executive.csv > county-legislature.csv, gender-count-chisquare-with-female-representation-score.py > gender-count-chisquare-with-female-representation-score-legislature.py, chi_square_results_with_female_representation_score_by_fips.csv > chi_square_results_with_female_representation_score_by_fips.csv > chi_square_results_with_female_representation_score_by_fips_legislature.csv, and follow the above steps.

## Credits

For more information about the original dataset, our modifications, and citations to this project, please visit the citations page of our website: https://code4policy.com/2024-b1-Local-Election-Database/citation-page/index.html. 
