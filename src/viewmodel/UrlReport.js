import moment from "moment";

const IS_INDEXED = {
	PASS: "Indexed",
	NEUTRAL: "Not Indexed"
}
export const BLOCKED_CRAWLING = {
	ROBOTS_TXT_STATE_UNSPECIFIED: "-",
	ALLOWED: "No",
	DISALLOWED: "Yes"
}
class UrlReport {
	constructor(data) {
		this.data = data;
	}

	toList() {
		const {
			url,
			verdict,
			coverageState,
			is_canonical,
			googleCanonical,
			userCanonical,
			lastCrawlTime,
			inspection_link,
			domain,
			_id
		} = this.data

		return {
			url: url || null,
			is_indexed: IS_INDEXED[verdict] || null,
			index_status: coverageState || null,
			is_canonical,
			google_selected_canonical: googleCanonical || null,
			user_selected_canonical: userCanonical || null,
			last_crawl_time: lastCrawlTime || null,
			days_since_last_crawl: lastCrawlTime ? moment().diff(moment(lastCrawlTime), 'days') : null,
			inspection_link: inspection_link || null,
			indexing_insight_link: `${process.env.APP_URL}/domain/${domain}/pages/${_id}`
		}
	}
	toMap() {
		const {
			url,
			verdict,
			coverageState,
			indexingState,
			crawledAs,
			lastCrawlTime,
			sitemaps,
			inspection_link,
			createdAt,
			last_inspection_date,
			robotsTxtState,
			pageFetchState,
			is_canonical,
			userCanonical,
			googleCanonical,
			last_indexed,
			last_canonical_change,
			last_crawling_blocked
		} = this.data;		

		return {
			url: url || null,
			is_indexed: IS_INDEXED[verdict] || null,
			index_status: coverageState || null,
			indexing_allowed: indexingState || null,
			is_canonical,
			google_selected_canonical: googleCanonical || null,
			user_selected_canonical: userCanonical || null,
			googlebot_primary_crawler: crawledAs || null,
			last_crawl_time: lastCrawlTime || null,
			days_since_last_crawl: lastCrawlTime ? moment().diff(moment(lastCrawlTime), 'days') : null,
			page_fetch_status: pageFetchState || null,
			blocked_by_robots_txt: BLOCKED_CRAWLING[robotsTxtState] || null,
			sitemaps: sitemaps || null,
			inspection_date: last_inspection_date || null,
			page_creation: createdAt || null,
			inspection_link: inspection_link || null,

			last_indexed: last_indexed ? "Yes" : "No",
			last_indexed_timestamp: last_indexed?.timestamp ? last_indexed?.timestamp : null,
			last_indexed_inspection_link:last_indexed?.inspection ? last_indexed?.inspection : null,

			last_canonical_change: last_canonical_change ? "Yes" : "No",
			last_google_selected_canonical: last_canonical_change?.googleCanonical || null,
			last_user_selected_canonical: last_canonical_change?.userCanonical || null,
			last_canonical_change_timestamp: last_canonical_change?.timestamp || null,
			last_canonical_change_inspection_link: last_canonical_change?.inspection || null,

			last_blocked_by_robots_txt: last_crawling_blocked ? "Yes": "No",
			last_blocked_by_robots_txt_timestamp: last_crawling_blocked?.timestamp || null,
			last_blocked_by_robots_txt_inspection_link: last_crawling_blocked?.inspection || null,
		};
	}
}

export default UrlReport;
