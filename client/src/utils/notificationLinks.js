export const getNotificationLink = (notification, role) => {
  if (notification?.link) return notification.link;

  const entityId = notification?.relatedEntityId || notification?.relatedId;
  const type = notification?.type;

  if (type === "message_received") {
    return role === "recruiter" ? "/recruiter/chat" : role === "candidate" ? "/candidate/chat" : "/chat";
  }

  if (role === "candidate") {
    if (type === "application_status_changed" || type === "interview_scheduled") {
      return "/candidate/applications";
    }
    if (type === "job_approved" || type === "job_rejected") {
      return entityId ? `/jobs/${entityId}` : "/candidate/jobs";
    }
    return "/candidate/notifications";
  }

  if (role === "recruiter") {
    if (type === "job_applied") {
      return entityId ? `/recruiter/candidates-list/${entityId}` : "/recruiter/candidates-list";
    }
    if (type === "job_approved" || type === "job_rejected") {
      return "/recruiter/postedjobs";
    }
    return "/recruiter/notifications";
  }

  if (role === "admin") {
    if (type === "job_applied") return "/admin/applications";
    if (type === "job_approved" || type === "job_rejected" || type === "system_alert") return "/admin/jobs";
    return "/admin/notifications";
  }

  return "/notifications";
};

export const getNotificationTone = (type) => {
  const tones = {
    job_applied: "text-blue-600 bg-blue-50",
    application_status_changed: "text-purple-600 bg-purple-50",
    interview_scheduled: "text-amber-600 bg-amber-50",
    message_received: "text-sky-600 bg-sky-50",
    recruiter_approved: "text-green-600 bg-green-50",
    job_approved: "text-green-600 bg-green-50",
    job_rejected: "text-red-600 bg-red-50",
    profile_updated: "text-indigo-600 bg-indigo-50",
    system_alert: "text-gray-700 bg-gray-100",
  };

  return tones[type] || "text-gray-700 bg-gray-100";
};
