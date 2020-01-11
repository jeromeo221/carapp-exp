const today = new Date();

module.exports = {
    today,
    yesterday: new Date(new Date().setDate(today.getDate()-1)),
    lastweek: new Date(new Date().setDate(today.getDate()-7)),
    lastmonth: new Date(new Date().setDate(today.getDate()-30))
}