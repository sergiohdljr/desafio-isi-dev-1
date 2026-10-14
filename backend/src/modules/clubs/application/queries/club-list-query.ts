export const CLUB_SORTS = ['name', 'net_worth_asc', 'net_worth_desc'] as const;

export type ClubSort = (typeof CLUB_SORTS)[number];

export type ClubListQuery = {
  sort: ClubSort;
};
