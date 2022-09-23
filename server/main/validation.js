////////////////////////////////////////////////////////////////////////////////

// Validate API Parameters
exports.validateParams = function(parameter) {
  if (parameter.length >= 1) {
    parameter = parameter.toString().replace(/[^a-zA-Z0-9.-]+/g, '');
  }
  return parameter;
};
