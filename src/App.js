import './App.css';
import React from 'react';
import Calendar from './calendar';
import {findDateDifference} from './utils';

const HAWKER_API_URL = "https://data.gov.sg/api/action/datastore_search?resource_id=b80cb643-a732-480d-86b5-e03957bc82aa&limit=500";
const CLEANING_DATES_FIELDS = [
  ['q1_cleaningstartdate', 'q1_cleaningenddate'],
  ['q2_cleaningstartdate', 'q2_cleaningenddate'],
  ['q3_cleaningstartdate', 'q3_cleaningenddate'],
  ['q4_cleaningstartdate', 'q4_cleaningenddate'],
]

const REG_NON_DATE = /[a-zA-Z]+/g;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cleaning: [],
      other_works: []
    }
  }

  componentDidMount() {
    this.fetchHawkers();
  }

  fetchHawkers() {
    const response = fetch(HAWKER_API_URL)
      .then(results => results.json())
      .then(result_json => this.extractInfo(result_json['result']['records']))
      .then(closed_dates => this.setState({
        cleaning: closed_dates[0],
        other_works: closed_dates[1]
      }));
  }

  extractInfo(APIresults) {
    /* This function takes the results from the API calls and extracts the relevant information into 2 dictionaries
    cleaning_date_dict : {string of date : [closed hawker ...] 
    other_works_dict : {string of date : [[closed hawker, reason] ...]}
    hawkers_desc : {hawker name : description of hawker ...}
    */
    var cleaning_date_dict = { 'default': [] }
    var other_works_dict = { 'default': [] }
    for (let idx = 0; idx < APIresults.length; idx++) {
      let hawker_result = APIresults[idx];
      let hawker_name = hawker_result['name']

      // Cleaning dates
      for (let dates_pair_idx = 0; dates_pair_idx < CLEANING_DATES_FIELDS.length; dates_pair_idx++) {
        let fields_start = CLEANING_DATES_FIELDS[dates_pair_idx][0];
        let fields_end = CLEANING_DATES_FIELDS[dates_pair_idx][1];
        let start_date = hawker_result[fields_start];
        let end_date = hawker_result[fields_end];

        if (REG_NON_DATE.test(start_date) || REG_NON_DATE.test(end_date)) {
          continue;
        }

        let dates_diff = findDateDifference(start_date, end_date);

        for (let dates_idx = 0; dates_idx < dates_diff.length; dates_idx++) {
          let date = dates_diff[dates_idx];

          if (date in cleaning_date_dict) {
            cleaning_date_dict[date] = cleaning_date_dict[date].concat([hawker_name]);
          }

          else {
            cleaning_date_dict[date] = [hawker_name];
          }
        }
      }

      // Other works
      var reason = hawker_result['remarks_other_works'];
      if (reason !== 'nil') {
        let other_works_dates_diff = findDateDifference(hawker_result['other_works_startdate'], hawker_result['other_works_enddate']);

        for (let i = 0; i < other_works_dates_diff.length; i++) {
          let date = other_works_dates_diff[i];

          if (date in other_works_dict) {
            other_works_dict[date] = other_works_dict[date].concat([[hawker_name, reason]]);
          }

          else {
            other_works_dict[date] = [[hawker_name, reason]];
          }
        }
      }
    }
    return [cleaning_date_dict, other_works_dict];
  }

  render() {
    return (
      <div className="App">
        <Calendar cleaning={this.state.cleaning} other_works={this.state.other_works} />
      </div>
    );
  }
}

export default App;
