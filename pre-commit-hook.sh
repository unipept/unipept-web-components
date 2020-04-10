# Exit the script immediately when one of the commands fails
set -e

# First run eslint
eslint "src/**/*.ts" "src/**/*.vue" "src/**/*.js"

# Then execute all unit tests
jest

