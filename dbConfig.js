module.exports = {
  user          : "aiyer",

  // Instead of hard coding the password, consider prompting for it,
  // passing it in an environment variable via process.env, or using
  // External Authentication.
  password      : "Dhinchday92",

  // For information on connection strings see:
  // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#connectionstrings
  connectString : "oracle.cise.ufl.edu:1521/orcl",

  // Setting externalAuth is optional.  It defaults to false.  See:
  // https://github.com/oracle/node-oracledb/blob/master/doc/api.md#extauth
  externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};