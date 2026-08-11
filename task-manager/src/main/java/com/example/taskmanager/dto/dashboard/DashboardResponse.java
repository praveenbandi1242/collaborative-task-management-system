package com.example.taskmanager.dto.dashboard;

import java.util.List;

public record DashboardResponse(
        DashboardStats stats,
        List<ProjectSummaryResponse> projects,
        List<RecentTaskResponse> recentTasks
) {
}