/** @function
 *
 * @name predictor
 *
 * @param {integer} timeUnknown - the time following the timeSet set of time values
 * @param {array} timeSet - set of integers representing time values corresponding to known values
 * @param {array} dataSet - set of integers representing known values corresponding to time
 *
 * @return {integer} - predicted value for the point of time set in timeUnknown
 * @author vosmer - vosmer@yandex.ru
 */
function predictor(timeUnknown, timeSet, dataSet) { //FORECAST from Excell
    var x_cp = 0;
    for (var tme = 0; tme < timeSet.length; tme++) {
        x_cp = x_cp + timeSet[tme];
    };
    x_cp = x_cp/timeSet.length;

    let y_cp = 0;
    for (var dat = 0; dat < dataSet.length; dat++) {
        y_cp = y_cp + dataSet[dat];
    };
    y_cp = y_cp / dataSet.length;

    let upPart = 0;
    let downPart = 0;
    for (var dat = 0; dat < dataSet.length; dat++) {
        upPart = upPart + ((parseInt(timeSet[dat]) - x_cp) * (dataSet[dat] - y_cp));
        downPart = downPart + ((parseInt(timeSet[dat]) - x_cp) * (parseInt(timeSet[dat]) - x_cp));
    };

    let b = upPart / downPart;
    let a = y_cp - (b * x_cp);
    let y = (b * timeUnknown) + a;
    return y;
}
