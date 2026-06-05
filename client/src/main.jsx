import { Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Toaster } from "react-hot-toast";
import "./i18n";
import "./index.css";
import "./styles/components.css";
import "./styles/animations.css";
import "./styles/chat.css";
import "./styles/responsive.css";
import { store } from "./redux/store.js";
import { SocketProvider } from "./context/SocketContext.jsx";
import ResumeLibrary from "./components/pdf/builder/PdfLibrary.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { PageLoader } from "./components/ui/Loader.jsx";
import AuthLoader from "./auth/AuthLoader.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import RoleBasedRoute from "./routes/RoleBasedRoute.jsx";
import DashboardLayout from "./components/dashboard/DashboardLayout.jsx";
import I18nRerenderBoundary from "./components/i18n/I18nRerenderBoundary.jsx";

setupListeners(store.dispatch);

const Layout = lazy(() => import("./layout/Layout.jsx"));
const Home = lazy(() => import("./pages/common/home/Home.jsx"));
const About = lazy(() => import("./pages/common/about/About.jsx"));
const Contact = lazy(() => import("./pages/common/contact/Contact.jsx"));
const PageNotFound = lazy(() => import("./pages/common/page404/Page404.jsx"));
const NotificationsPage = lazy(() => import("./pages/common/notifications/NotificationsPage.jsx"));
const Profile = lazy(() => import("./pages/common/profile/Profile.jsx"));
const EditProfile = lazy(() => import("./pages/common/profile/edit/EditProfile.jsx"));
const CompanyAboutCard = lazy(() => import("./pages/common/jobs/companyDetails/CompanyCard.jsx"));
const Companies = lazy(() => import("./components/companyCard/Companies.jsx"));
const FAQ = lazy(() => import("./pages/common/faq/FAQ.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/common/privecy&policiy/PrivacyPolicy.jsx"));
const EnhancedBlogList = lazy(() => import("./pages/common/blogs/EnhancedBlogList.jsx"));
const BlogDetails = lazy(() => import("./pages/common/blogs/BlogDetails.jsx"));
const Jobs = lazy(() => import("./pages/common/jobs/Jobs.jsx"));
const ChatPage = lazy(() => import("./pages/common/chatpage/Chatpage.jsx"));
const PdfBuilder = lazy(() => import("./components/pdf/Pdf.jsx"));
const JobDetailsPage = lazy(() => import("./pages/common/jobs/JobDetails/JobDetailsPage.jsx"));
const ResumeTips = lazy(() => import("./components/resumeTips/ResumeTips.jsx"));
const InterviewTips = lazy(() => import("./components/interviewTips/InterviewTips.jsx"));
const SalaryGuide = lazy(() => import("./components/salaryGuide/SalaryGuide.jsx"));
const SavedJobs = lazy(() => import("./components/saved-jobs/SavedJobs.jsx"));

const Login = lazy(() => import("./auth/login/Login.jsx"));
const Register = lazy(() => import("./auth/register/Register.jsx"));
const ForgotPassword = lazy(() => import("./auth/forgot-password/ForgotPassword.jsx"));

const CompanyView = lazy(() => import("./pages/recruiter/company/Company.jsx"));
const CompanyRegistration = lazy(() => import("./pages/recruiter/company/compRegis/CompRegis.jsx"));
const JobPost = lazy(() => import("./pages/recruiter/jobPost/JobPost.jsx"));
const PostedJobs = lazy(() => import("./pages/recruiter/jobPost/postedjobs/PostedJobs.jsx"));
const EditJob = lazy(() => import("./pages/recruiter/jobPost/postedjobs/editJobs/EditJob.jsx"));
const CandidatesList = lazy(() => import("./pages/recruiter/candidates-list/Candidates.jsx"));
const CandidatesView = lazy(() => import("./pages/recruiter/candidates-list/cadidatedata/CandidateOverview.jsx"));
const CompanyEdit = lazy(() => import("./pages/recruiter/company/edit/EditCompnay.jsx"));
const CandidateProfile = lazy(() => import("./pages/recruiter/candidates-list/cadidatedata/CadidatesData.jsx"));
const CompanyBlogList = lazy(() => import("./pages/recruiter/blogs/CompanyBlogList.jsx"));
const CreateBlog = lazy(() => import("./pages/recruiter/blogs/CreateBlog.jsx"));
const EditBlog = lazy(() => import("./pages/recruiter/blogs/EditBlog.jsx"));
const RecruiterDashboard = lazy(() => import("./pages/recruiter/RecruiterDashboard.jsx"));
const RecruiterAnalytics = lazy(() => import("./pages/recruiter/RecruiterAnalytics.jsx"));
const InterviewScheduler = lazy(() => import("./pages/recruiter/InterviewScheduler.jsx"));
const ATSBoard = lazy(() => import("./pages/recruiter/ATSBoard.jsx"));
const RecruiterSubscription = lazy(() => import("./pages/recruiter/subscription/Subscription.jsx"));
const SubscriptionPlans = lazy(() => import("./pages/recruiter/subscription/Plans.jsx"));
const SubscriptionPlanDetails = lazy(() => import("./pages/recruiter/subscription/PlanDetails.jsx"));
const SubscriptionCheckout = lazy(() => import("./pages/recruiter/subscription/Checkout.jsx"));
const SubscriptionPaymentSuccess = lazy(() => import("./pages/recruiter/subscription/PaymentSuccess.jsx"));
const SubscriptionPaymentFailed = lazy(() => import("./pages/recruiter/subscription/PaymentFailed.jsx"));
const SubscriptionHistory = lazy(() => import("./pages/recruiter/subscription/History.jsx"));
const SubscriptionInvoice = lazy(() => import("./pages/recruiter/subscription/Invoice.jsx"));
const SubscriptionDetails = lazy(() => import("./pages/recruiter/subscription/Details.jsx"));
const VerifyEmail = lazy(() => import("./components/verifications/VerifyEmail.jsx"));
const RecruiterJobView = lazy(() => import("./pages/recruiter/jobPost/view/ViewJob.jsx"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement.jsx"));
const CompanyManagement = lazy(() => import("./pages/admin/CompanyManagement.jsx"));
const JobManagement = lazy(() => import("./pages/admin/JobManagement.jsx"));
const Analytics = lazy(() => import("./pages/admin/Analytics.jsx"));
const ApplicationManagement = lazy(() => import("./pages/admin/ApplicationManagement.jsx"));
const AdminReports = lazy(() => import("./pages/admin/Reports.jsx"));
const AdminSubscriptions = lazy(() => import("./pages/admin/Subscriptions.jsx"));
const JobProfessions = lazy(() => import("./pages/admin/JobProfessions.jsx"));
const BlogManagement = lazy(() => import("./pages/admin/BlogManagement.jsx"));
const AdminBlogCreate = lazy(() => import("./pages/admin/BlogCreate.jsx"));
const AdminBlogEdit = lazy(() => import("./pages/admin/BlogEdit.jsx"));
const Settings = lazy(() => import("./pages/common/settings/Settings.jsx"));

const CandidateHome = lazy(() => import("./pages/candidates/Home.jsx"));
const Resume = lazy(() => import("./pages/candidates/resume/Resume.jsx"));
const CreateResume = lazy(() => import("./pages/candidates/resume/create/CreateResume.jsx"));
const EditResume = lazy(() => import("./pages/candidates/resume/create/EditResume.jsx"));
const JobApply = lazy(() => import("./pages/candidates/applyjobs/JobApply.jsx"));
const AppliedJobs = lazy(() => import("./pages/candidates/applyjobs/appliedJobs/AppliedJobList.jsx"));

const page = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const protectedPage = (Component, roles) => (
  <ProtectedRoute roles={roles}>
    {page(Component)}
  </ProtectedRoute>
);

const redirect = (to) => <Navigate replace to={to} />;

const LegacyJobRedirect = () => {
  const { jobId } = useParams();
  return <Navigate replace to={jobId ? `/jobs/${jobId}` : "/candidate/applications"} />;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: page(Layout),
    children: [
      { index: true, element: page(Home) },
      { path: "login", element: page(Login) },
      { path: "register", element: page(Register) },
      { path: "forgot-password", element: page(ForgotPassword) },
      { path: "email-verify", element: page(VerifyEmail) },
      { path: "register/email-verify", element: page(VerifyEmail) },
      { path: "login/register", element: redirect("/register") },
      { path: "about", element: page(About) },
      { path: "contact", element: page(Contact) },
      { path: "chat", element: protectedPage(ChatPage) },
      { path: "messages", element: redirect("/chat") },
      { path: "notification", element: redirect("/notifications") },
      { path: "notifications", element: protectedPage(NotificationsPage) },
      { path: "profile", element: protectedPage(Profile) },
      { path: "profile/edit/:userId", element: protectedPage(EditProfile) },
      { path: "settings", element: protectedPage(Settings) },
      { path: "jobs/:jobId", element: page(JobDetailsPage) },
      { path: "jobs", element: page(Jobs) },
      { path: "blog", element: page(EnhancedBlogList) },
      { path: "blogs", element: page(EnhancedBlogList) },
      { path: "company/:companyId", element: page(CompanyAboutCard) },
      { path: "company-stories", element: redirect("/blogs") },
      { path: "blog/:blogId", element: page(BlogDetails) },
      { path: "blogs/:blogId", element: page(BlogDetails) },
      { path: "privacy-policy", element: page(PrivacyPolicy) },
      { path: "faq", element: page(FAQ) },
      { path: "companies", element: page(Companies) },
      { path: "resources/resume-tips", element: page(ResumeTips) },
      { path: "resources/interview-tips", element: page(InterviewTips) },
      { path: "resources/salary-guide", element: page(SalaryGuide) },
      { path: "saved-jobs", element: protectedPage(SavedJobs, ["candidate"]) },
      { path: "*", element: page(PageNotFound) },
    ],
  },
  {
    path: "/recruiter",
    element: (
      <RoleBasedRoute roles={["recruiter"]}>
        <DashboardLayout role="recruiter" />
      </RoleBasedRoute>
    ),
    children: [
      { index: true, element: redirect("/recruiter/dashboard") },
      { path: "dashboard", element: page(RecruiterDashboard) },
      { path: "company/:companyId", element: page(CompanyView) },
      { path: "company/edit/:id", element: page(CompanyEdit) },
      { path: "company/registration", element: page(CompanyRegistration) },
      { path: "profile", element: page(Profile) },
      { path: "profile/edit/:userId", element: page(EditProfile) },
      { path: "settings", element: page(Settings) },
      { path: "jobpost", element: page(JobPost) },
      { path: "company/jobpost", element: redirect("/recruiter/jobpost") },
      { path: "postedjobs", element: page(PostedJobs) },
      { path: "jobs/:jobId", element: page(RecruiterJobView) },
      { path: "jobs", element: redirect("/recruiter/postedjobs") },
      { path: "company/postedjobs", element: redirect("/recruiter/postedjobs") },
      { path: "postedjobs/edit/:jobId", element: page(EditJob) },
      { path: "company/postedjobs/edit/:jobId", element: page(EditJob) },
      { path: "candidates-list", element: page(CandidatesList) },
      { path: "applications", element: redirect("/recruiter/candidates-list") },
      { path: "candidates-list/:applicationId", element: page(CandidatesView) },
      { path: "candidates-list/candidate/:applicationId", element: page(CandidateProfile) },
      { path: "chat", element: page(ChatPage) },
      { path: "messages", element: redirect("/recruiter/chat") },
      { path: "notifications", element: page(NotificationsPage) },
      { path: "blogs", element: page(CompanyBlogList) },
      { path: "blogs/create", element: page(CreateBlog) },
      { path: "blogs/edit/:blogId", element: page(EditBlog) },
      { path: "subscription", element: page(RecruiterSubscription) },
      { path: "subscription/plans", element: page(SubscriptionPlans) },
      { path: "subscription/plans/:planId", element: page(SubscriptionPlanDetails) },
      { path: "subscription/checkout/:planId", element: page(SubscriptionCheckout) },
      { path: "subscription/payment-success", element: page(SubscriptionPaymentSuccess) },
      { path: "subscription/payment-failed", element: page(SubscriptionPaymentFailed) },
      { path: "subscription/history", element: page(SubscriptionHistory) },
      { path: "subscription/invoice/:paymentId", element: page(SubscriptionInvoice) },
      { path: "subscription/details", element: page(SubscriptionDetails) },
      { path: "subscription/*", element: redirect("/recruiter/subscription") },
      { path: "analytics", element: page(RecruiterAnalytics) },
      { path: "interview-scheduler", element: page(InterviewScheduler) },
      { path: "ats-board", element: page(ATSBoard) },
      { path: "pdf-builder", element: page(PdfBuilder) },
      { path: "pdf-library", element: page(ResumeLibrary) },
    ],
  },
  {
    path: "/candidate",
    element: (
      <RoleBasedRoute roles={["candidate"]}>
        <DashboardLayout role="candidate" />
      </RoleBasedRoute>
    ),
    children: [
      { index: true, element: redirect("/candidate/home") },
      { path: "home", element: page(CandidateHome) },
      { path: "dashboard", element: redirect("/candidate/home") },
      { path: "profile", element: page(Profile) },
      { path: "profile/edit/:userId", element: page(EditProfile) },
      { path: "settings", element: page(Settings) },
      { path: "resume", element: page(Resume) },
      { path: "create-resume", element: page(CreateResume) },
      { path: "edit-resume", element: page(EditResume) },
      { path: "jobs", element: page(Jobs) },
      { path: "job/apply", element: page(JobApply) },
      { path: "job/apply/:jobId", element: page(JobApply) },
      { path: "companyaboutcard/jobs/apply", element: redirect("/candidate/job/apply") },
      { path: "CompanyAboutCard/:jobId", element: <LegacyJobRedirect /> },
      { path: "applications", element: page(AppliedJobs) },
      { path: "appliedJobs", element: redirect("/candidate/applications") },
      { path: "appliedjobs", element: redirect("/candidate/applications") },
      { path: "applications/list", element: redirect("/candidate/applications") },
      { path: "saved-jobs", element: page(SavedJobs) },
      { path: "chat", element: page(ChatPage) },
      { path: "messages", element: redirect("/candidate/chat") },
      { path: "notifications", element: page(NotificationsPage) },
    ],
  },
  {
    path: "/admin",
    element: (
      <RoleBasedRoute roles={["admin"]}>
        <DashboardLayout role="admin" />
      </RoleBasedRoute>
    ),
    children: [
      { index: true, element: page(AdminDashboard) },
      { path: "users", element: page(UserManagement) },
      { path: "companies", element: page(CompanyManagement) },
      { path: "jobs", element: page(JobManagement) },
      { path: "applications", element: page(ApplicationManagement) },
      { path: "subscriptions", element: page(AdminSubscriptions) },
      { path: "reports", element: page(AdminReports) },
      { path: "blogs", element: page(BlogManagement) },
      { path: "blogs/create", element: page(AdminBlogCreate) },
      { path: "blogs/edit/:blogId", element: page(AdminBlogEdit) },
      { path: "professions", element: page(JobProfessions) },
      { path: "analytics", element: page(Analytics) },
      { path: "profile", element: page(Profile) },
      { path: "profile/edit/:userId", element: page(EditProfile) },
      { path: "settings", element: page(Settings) },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <ErrorBoundary>
      <I18nRerenderBoundary>
        <SocketProvider>
          <AuthLoader>
            <RouterProvider router={routes} />
          </AuthLoader>
          <Toaster
            position={document.documentElement.dir === "rtl" ? "top-left" : "top-right"}
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: "8px",
                fontSize: "14px",
              },
            }}
          />
        </SocketProvider>
      </I18nRerenderBoundary>
    </ErrorBoundary>
  </Provider>
);
