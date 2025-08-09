const { body, validationResult } = require("express-validator");

const serviceHistoryRules = () => {
  return [
    body("service_date")
      .notEmpty()
      .withMessage("Service date is required.")
      .isISO8601()
      .withMessage("Service date must be a valid date."),
    
    body("description")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Description must be at least 5 characters long."),
    
    body("cost")
      .notEmpty()
      .withMessage("Cost is required.")
      .isFloat({ min: 0 })
      .withMessage("Cost must be a positive number.")
  ];
};

// Check validation result middleware
const checkServiceHistoryData = async (req, res, next) => {
  const errors = validationResult(req);
  const { inv_id, service_id, service_date, description, cost } = req.body;

  if (!errors.isEmpty()) {
    let viewName;
    let viewData;

    if (req.originalUrl.includes("add")) {
      viewName = "serviceHistory/add";
      viewData = { 
        title: "Add Service Record", 
        inv_id, 
        service_date, 
        description, 
        cost, 
        errors: errors.array() 
      };
    } else {
      viewName = "serviceHistory/edit";
      viewData = { 
        title: "Edit Service Record", 
        record: { service_id, inv_id, service_date, description, cost }, 
        errors: errors.array() 
      };
    }

    return res.render(viewName, viewData);
  }
  next();
};

module.exports = {
  serviceHistoryRules,
  checkServiceHistoryData
};
