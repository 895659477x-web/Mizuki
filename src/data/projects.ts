export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	visitUrl?: string;
	progress?: number;
	highlights?: string[];
}

export const projectsData: Project[] = [
	{
		id: "kaguya-ai",
		title: "KAGUYA AI \u958b\u767a\u30d7\u30ed\u30b8\u30a7\u30af\u30c8",
		description:
			"\u6708\u3068\u672a\u6765\u3092\u7d50\u3076 KAGUYA AI \u306e\u958b\u767a\u30d7\u30ed\u30b8\u30a7\u30af\u30c8\u3002",
		image: "",
		category: "other",
		techStack: ["\u4eba\u5de5\u77e5\u80fd", "\u672a\u6765\u63a5\u7d9a", "\u6708\u5149\u30c7\u30b6\u30a4\u30f3"],
		status: "in-progress",
		startDate: "2026-03-11",
		featured: true,
		tags: ["\u6708", "AI", "\u672a\u6765", "\u958b\u767a"],
		progress: 1,
		highlights: [
			"\u6708\u3092\u30e2\u30c1\u30fc\u30d5\u306b\u3057\u305f AI \u958b\u767a",
			"\u672a\u6765\u3078\u3064\u306a\u304c\u308b\u30d3\u30b8\u30e7\u30f3",
			"\u9759\u304b\u306b\u5bc4\u308a\u6dfb\u3046\u30c7\u30b6\u30a4\u30f3\u601d\u60f3",
		],
	},
];

export const getProjectStats = () => {
	return {
		total: projectsData.length,
		byStatus: {
			completed: 0,
			inProgress: 1,
			planned: 0,
		},
	};
};

export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet);
};
