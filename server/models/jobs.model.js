const mongoose = require("mongoose");

const jobsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  jobProfession: {
    type: String,
    enum: [
  "Accounts Assistant",
      "Analytical Tester",
      "Assorter",
      "Asst.Production Manager",
      "Back Office Executive",
      "B2B Sales Manager (International)",
      "CAD Designer",
      "CAD Designer (Export)",
      "CAD HOD",
      "CAM Machine Operator",
      "CAM Worker",
      "Caster/Casting",
      "Chain Maker",
      "Color Stone Executive / Grader",
      "Corel Designer (local Market)",
      "Creative Graphic Designer",
      "Data Entry Operator",
      "Data Entry Operator (Diamond Department)",
      "Diamond Assorter / Grader",
      "Diamond Baging Executive",
      "Diamond QC",
      "EXIM Manager / Executive",
      "Filler",
      "Final QC Analyst / Specialist",
      "Finding Executive",
      "General Manager / Chief Manager",
      "Gold Central Accountant",
      "Gold Central HOD (EMR Software)",
      "Gold Central HOD (Gati Software)",
      "Gold/Silver Smith",
      "Graphic Designer",
      "Hand Engraver/Stamping",
      "Hand Setter (Diamond/Gem)",
      "Helper/Traini",    //ng Staff
      "HOD",
      "HR Assistant",
      "HR Manager / Executive",
      "HR Plant Operations",
      "IGI Data Operator (Gati)",
      "Inventory Executive / Stock Manager",
      "Jewellery Consultant",
      "Jewellery Merchandiser",
      "Laser Machine Operator / CNC",
      "Loss Control Manager",
      "MIS Executive",
      "Maintanance/Technical Staff",
      "Manual Designer",
      "Marketing Back Office (EMR / Gati)",
      "Marketing Executive",
      "Marketing Head Executive",
      "Micro Setter (Diamond/Gem)",
      "Model Maker/Wax Carver",
      "PD / R & D",
      "PD Assistant",
      "PD Merchandiser",
      "Polish QC",
      "Polisher",
      "Production Coordinator / PPC",
      "Production Manager",
      "Production Supervisor",
      "Purchase Executive",
      "QA Manager",
      "Reception Staff",
      "Rhodium/Enamal",
      "Sample Maker (Sample Lining Executive)",
      "Sales Executive",
      "Sales Executive (USA, Europe, Middle East)",
      "Sales Head Executive",
      "Senior Assorter",
      "Senior CRM",
      "Setting QC",
      "Shop Manager",
      "Sourcing Manager / Executive(Gold / Gems)",
      "Store Manager",
      "Surveillance Executive",
      "Visual Merchandiser(VM)",
      "Waxing/Wax Puller",
      "Wax Setter (Diamond/Gem)",
    ],
    required: true,
  },
  jobLocation: { type: String, required: true },
  empType: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract", "Remote", "Internship /Trainee"],
    default: "Full-time",
  },
  experience: {
    type: String,
    enum: ["Fresher-0", "1-year", "2-years", "3-years", "4-years", "5-years", "6-years", "7-years", "8-years", "9-years", "10+ years"],
    default: "Fresher-0",
  },
  salary: {
    monthly: { min: { type: Number }, max: { type: Number } },
    hourly: { min: { type: Number }, max: { type: Number } },
    perPiece: { min: { type: Number }, max: { type: Number } },
    contract: { min: { type: Number }, max: { type: Number } }
  },
  openings: { type: Number, default: 1 },
  deadline: { type: Date },
  expiresAt: { type: Date, index: true },
  isExpired: { type: Boolean, default: false, index: true },
  skills: { type: [String], required: true },
  additionalRequirement: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyName: { type: String, required: true },
  companyEmail: { type: String, required: true },
  companyAddress: { type: String },
  companyWebsite: { type: String },
  companyDescription: { type: String },
  status: {
    type: String,
    enum: ["active", "paused", "closed", "expired", "draft", "Open", "Paused", "Closed"],
    default: "active",
    index: true,
  },
  approvalStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
    index: true,
  },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null },
  moderationNote: { type: String, default: "", maxlength: 500 },
}, { timestamps: true, versionKey: false });

jobsSchema.pre('validate', function (next) {
  const expiry = this.expiresAt || this.deadline;
  if (expiry && !this.expiresAt) this.expiresAt = expiry;
  if (expiry && !this.deadline) this.deadline = expiry;

  if (expiry && new Date(expiry).getTime() <= Date.now()) {
    this.isExpired = true;
    this.status = "expired";
  } else if (this.status !== "expired") {
    this.isExpired = false;
  }

  next();
});

jobsSchema.pre('save', function (next) {
  const hasAnySalary = Object.values(this.salary || {}).some(
    type => type?.min !== undefined || type?.max !== undefined
  );
  if (!hasAnySalary) {
    return next(new Error('At least one salary type must be specified'));
  }
  const salaryTypes = ['monthly', 'hourly', 'perPiece', 'contract'];
  for (const type of salaryTypes) {
    const salaryType = this.salary?.[type];
    if (salaryType) {
      if (salaryType.min !== undefined && salaryType.max !== undefined) {
        if (salaryType.min >= salaryType.max) {
          return next(new Error(`Maximum salary must be greater than minimum salary for ${type}`));
        }
      }
    }
  }
  next();
});

jobsSchema.index({ companyId: 1, createdAt: -1 });
jobsSchema.index({ recruiterId: 1, createdAt: -1 });
jobsSchema.index({ jobProfession: 1 });
jobsSchema.index({ jobLocation: 1 });
jobsSchema.index({ empType: 1 });
jobsSchema.index({ experience: 1 });
jobsSchema.index({ status: 1, approvalStatus: 1, createdAt: -1 });
jobsSchema.index({ status: 1, approvalStatus: 1, expiresAt: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobsSchema);
module.exports = Job;
