const express = require("express");
const interviewRoutes = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const interviewController = require("../controllers/interviews.controller");

interviewRoutes.use(protect);

interviewRoutes.get("/", (req, res) => {
  const recruiterId = req.user.role === "admin" ? req.query.recruiterId : req.user._id.toString();

  if (!recruiterId) {
    return res.status(400).json({
      success: false,
      code: "RECRUITER_ID_REQUIRED",
      message: "recruiterId query parameter is required for admin interview listing",
    });
  }

  req.params.recruiterId = recruiterId;
  return interviewController.getRecruiterInterviews(req, res);
});

interviewRoutes.get(
  "/recruiter/:recruiterId/upcoming",
  interviewController.getUpcomingInterviews
);
interviewRoutes.get("/recruiter/:recruiterId", interviewController.getRecruiterInterviews);
interviewRoutes.post("/", interviewController.createInterview);
interviewRoutes.get("/:id", interviewController.getInterviewById);
interviewRoutes.put("/:id", interviewController.updateInterview);
interviewRoutes.patch("/:id", interviewController.updateInterview);
interviewRoutes.patch("/:id/status", interviewController.updateInterviewStatus);
interviewRoutes.delete("/:id", interviewController.deleteInterview);

module.exports = interviewRoutes;
