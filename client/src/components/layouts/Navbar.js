import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { logout } from "../../actions/auth";

function Navbar({ auth: { isAuthenticated, loading }, logout }) {
  const authLinks = (
    <ul>
    <li>
        <Link to="/profiles">Developers</Link>
      </li>
      <li>
        <Link to="/posts">Posts</Link>
      </li>
      <li>
        <Link to="/dashboard">
        <i className='fa fa-user'/> {' '}
        <span className="hide-sm">Dashboard </span>
        </Link>
      </li>
      <li>
        <Link to= "/" onClick={logout}> 
          <i className='fa fa-sign-out'> </i>
          <span className="hide-sm"> SignOut</span>
        </Link>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul>
    <li>
        <Link to="/profiles">Developer</Link>
      </li>

      <li>
        <Link to="/register">Register</Link>
      </li>
      <li>
        <Link to="/login">Login</Link>
      </li>
    </ul>
  );
  return (
    <nav className="navbar bg-dark">
      <h1>
        <Link to='/'>
          <i className="fa fa-code"></i> DevConnector
        </Link>
      </h1>
      {/* we want to show our links we loading is done */}
      {!loading && (
        <Fragment>{isAuthenticated ? authLinks : guestLinks}</Fragment>
      )}
    </nav>
  );
}
Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, { logout })(Navbar);
