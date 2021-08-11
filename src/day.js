import React from 'react';

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
export default Day;