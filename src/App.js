import './App.css';
import React from 'react';

const HAWKER_API_URL = "https://data.gov.sg/api/action/datastore_search?resource_id=b80cb643-a732-480d-86b5-e03957bc82aa&limit=500";
const CLEANING_DATES_FIELDS = [
  ['q1_cleaningstartdate', 'q1_cleaningenddate'],
  ['q2_cleaningstartdate', 'q2_cleaningenddate'],
  ['q3_cleaningstartdate', 'q3_cleaningenddate'],
  ['q4_cleaningstartdate', 'q4_cleaningenddate'],
]

const REG_NON_DATE = /[a-zA-Z]+/g;

function getStringFromDate(date) {
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}

function getDateFromString(date_string) {
  // String should be in DD/MM/YYYY format
  const date_components = date_string.split('/'); // [DD, MM, YYYY]
  return new Date(date_components[2], date_components[1] - 1, date_components[0]);
}

function findDateDifference(start_date, end_date) {
  // get all dates in between start_date and end_date inclusive
  // dates are in string format
  
  var dates_arr = [start_date];
  if (start_date === end_date) {
    return dates_arr;
  }

  else {
    var start_date_object = getDateFromString(start_date);
    var end_date_object = getDateFromString(end_date);

    while (getStringFromDate(start_date_object) !== getStringFromDate(end_date_object)) {
      start_date_object.setDate(start_date_object.getDate() + 1);
      dates_arr.push(getStringFromDate(start_date_object));
    }
    return dates_arr;
  }
}

class Day extends React.Component {
  render() {
    const cleaning_hawkers = this.props.cleaning_hawkers;
    const cleaning = cleaning_hawkers.map(hawker => {
      return (<li>{hawker}</li>)
    })
    return (
      <div className="date">
      {this.props.day}

      <div className="cleaning">
      Under cleaning
      <ul>{cleaning}</ul>
      </div>
      </div>
    )
  }
}

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    var date = new Date();
    this.state = {
      current : getStringFromDate(date),
      date_object : date,
    }
  }

  yesterday() {
    var date = this.state.date_object;
    date.setDate(date.getDate() - 1)
    this.setState(
      {
        current : getStringFromDate(date),
        date_object : date,
      }
    )
  }

  tomorrow() {
    var date = this.state.date_object;
    date.setDate(date.getDate() + 1)
    this.setState(
      {
        current : getStringFromDate(date),
        date_object : date,
      }
    )
  }

  render() {
    var hawkers_in_cleaning = this.state.current in this.props.cleaning ? this.props.cleaning[this.state.current] : [];
    return (
      <div className="calendar">
      <button className="yesterday" onClick={() => this.yesterday()}> 
      yesterday
      </button>
      <button className="tomorrow" onClick={() => this.tomorrow()}> 
      tomorrow
      </button>
      <Day day={this.state.current} cleaning_hawkers={hawkers_in_cleaning}/>
      </div>
      
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cleaning : [],
      other_works : []
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
      cleaning : closed_dates[0],
      other_works : closed_dates[1]
    }));
  }

  extractInfo(APIresults) {
    /* This function takes the results from the API calls and extracts the relevant information into 2 dictionaries
    cleaning_date_dict : {string of date : [closed hawker ...] 
    other_works_dict : {string of date : [[closed hawker, reason] ...]}
    hawkers_desc : {hawker name : description of hawker ...}
    */
    var cleaning_date_dict = {'default': []}
    var other_works_dict = {'default':[]}
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
        <Calendar cleaning={this.state.cleaning} other_works={this.state.other_works}/>
      </div>
    );
  }
}

export default App;
