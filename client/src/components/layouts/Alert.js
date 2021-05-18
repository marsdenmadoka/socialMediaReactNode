import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

//racfp
const Alert = ({ alerts }) =>
  alerts !== null &&
  alerts.length > 0 &&
  alerts.map(alert => (
    <div key={alert.id} className={`alert alert-${alert.alertType}`}>
      {alert.msg}
    </div>
  ));
Alert.propTypes = {
  alerts: PropTypes.array.isRequired, // our alert props// our alert was of initialState[] array in our alert reducer
};
const mapStateToProps = (state) => ({
  //mapping the redux state to a prop so that we have access to it
  alerts: state.alert, //alert from root reducer
});
export default connect( mapStateToProps)(Alert);
