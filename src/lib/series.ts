export type Series = {
	slug: string;
	title: string;
	description: string;
	photosetId: string;
	coverUrl?: string;
};

export const series: Series[] = [
	{
		slug: 'post-op',
		title: 'Under Observation',
		description: 'A photographic sequence made before, during, and after a surgical intervention. The work does not document the procedure itself, but the surrounding conditions: anticipation, monitoring, dependency, and the gradual re-encounter with the body afterward.',
		photosetId: '72177720331266539'
	}
];
