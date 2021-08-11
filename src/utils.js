function getStringFromDate(date) {
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
}

function getDateFromString(date_string) {
  // String should be in DD/MM/YYYY format  
  var date_components = date_string.split('/'); // [DD, MM, YYYY]
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

export {getStringFromDate, getDateFromString, findDateDifference};
