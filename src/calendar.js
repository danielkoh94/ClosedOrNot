import Day from './day';
import React from 'react';
import {getStringFromDate} from './utils';

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    var date = new Date();
    this.state = {
      current: getStringFromDate(date),
      date_object: date,
    }
  }

  yesterday() {
    var date = this.state.date_object;
    date.setDate(date.getDate() - 1)
    this.setState(
      {
        current: getStringFromDate(date),
        date_object: date,
      }
    )
  }

  tomorrow() {
    var date = this.state.date_object;
    date.setDate(date.getDate() + 1)
    this.setState(
      {
        current: getStringFromDate(date),
        date_object: date,
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
        <Day day={this.state.current} cleaning_hawkers={hawkers_in_cleaning} />
      </div>

    )
  }
}

export default Calendar;