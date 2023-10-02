import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { TablePlaceholder, VirtualizedTable } from 'component/common/Table';
import {
    SortingRule,
    useFlexLayout,
    useRowSelect,
    useSortBy,
    useTable,
} from 'react-table';
import { SearchHighlightProvider } from 'component/common/Table/SearchHighlightContext/SearchHighlightContext';
import { Checkbox, useMediaQuery } from '@mui/material';
import { sortTypes } from 'utils/sortTypes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { HighlightCell } from 'component/common/Table/cells/HighlightCell/HighlightCell';
import { DateCell } from 'component/common/Table/cells/DateCell/DateCell';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { Search } from 'component/common/Search/Search';
import { FeatureTypeCell } from 'component/common/Table/cells/FeatureTypeCell/FeatureTypeCell';
import { FeatureSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureSeenCell';
import { LinkCell } from 'component/common/Table/cells/LinkCell/LinkCell';
import { ArchivedFeatureActionCell } from 'component/archive/ArchiveTable/ArchivedFeatureActionCell/ArchivedFeatureActionCell';
import { featuresPlaceholder } from 'component/feature/FeatureToggleList/FeatureToggleListTable';
import theme from 'themes/theme';
import { FeatureSchema } from 'openapi';
import { useFeatureArchiveApi } from 'hooks/api/actions/useFeatureArchiveApi/useReviveFeatureApi';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useSearch } from 'hooks/useSearch';
import { FeatureArchivedCell } from './FeatureArchivedCell/FeatureArchivedCell';
import { useSearchParams } from 'react-router-dom';
import { ArchivedFeatureDeleteConfirm } from './ArchivedFeatureActionCell/ArchivedFeatureDeleteConfirm/ArchivedFeatureDeleteConfirm';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { useConditionallyHiddenColumns } from 'hooks/useConditionallyHiddenColumns';
import { RowSelectCell } from '../../project/Project/ProjectFeatureToggles/RowSelectCell/RowSelectCell';
import { BatchSelectionActionsBar } from '../../common/BatchSelectionActionsBar/BatchSelectionActionsBar';
import { ArchiveBatchActions } from './ArchiveBatchActions';
import { FeatureEnvironmentSeenCell } from 'component/common/Table/cells/FeatureSeenCell/FeatureEnvironmentSeenCell';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export interface IFeaturesArchiveTableProps {
    archivedFeatures: FeatureSchema[];
    title: string;
    refetch: () => void;
    loading: boolean;
    storedParams: SortingRule<string>;
    setStoredParams: (
        newValue:
            | SortingRule<string>
            | ((prev: SortingRule<string>) => SortingRule<string>)
    ) => SortingRule<string>;
    projectId?: string;
}

export const ArchiveTable = ({
    archivedFeatures = [],
    loading,
    refetch,
    storedParams,
    setStoredParams,
    title,
    projectId,
}: IFeaturesArchiveTableProps) => {
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const { setToastData, setToastApiError } = useToast();

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletedFeature, setDeletedFeature] = useState<IFeatureToggle>();

    const [searchParams, setSearchParams] = useSearchParams();
    const { reviveFeature } = useFeatureArchiveApi();

    const [searchValue, setSearchValue] = useState(
        searchParams.get('search') || ''
    );

    const { uiConfig } = useUiConfig();
    const showEnvironmentLastSeen = Boolean(
        uiConfig.flags.lastSeenByEnvironment
    );

    const onRevive = useCallback(
        async (feature: string) => {
            try {
                await reviveFeature(feature);
                await refetch();
                setToastData({
                    type: 'success',
                    title: "And we're back!",
                    text: 'The feature toggle has been revived.',
                });
            } catch (e: unknown) {
                setToastApiError(formatUnknownError(e));
            }
        },
        [refetch, reviveFeature, setToastApiError, setToastData]
    );

    const columns = useMemo(
        () => [
            ...(projectId
                ? [
                      {
                          id: 'Select',
                          Header: ({ getToggleAllRowsSelectedProps }: any) => (
                              <Checkbox {...getToggleAllRowsSelectedProps()} />
                          ),
                          Cell: ({ row }: any) => (
                              <RowSelectCell
                                  {...row?.getToggleRowSelectedProps?.()}
                              />
                          ),
                          maxWidth: 50,
                          disableSortBy: true,
                          hideInMenu: true,
                      },
                  ]
                : []),
            {
                Header: 'Seen',
                accessor: 'lastSeenAt',
                Cell: ({ value, row: { original: feature } }: any) => {
                    return showEnvironmentLastSeen ? (
                        <FeatureEnvironmentSeenCell feature={feature} />
                    ) : (
                        <FeatureSeenCell value={value} />
                    );
                },
                align: 'center',
                maxWidth: 80,
            },
            {
                Header: 'Type',
                accessor: 'type',
                width: 85,
                canSort: true,
                Cell: FeatureTypeCell,
                align: 'center',
            },
            {
                Header: 'Name',
                accessor: 'name',
                searchable: true,
                minWidth: 100,
                Cell: ({ value, row: { original } }: any) => (
                    <HighlightCell
                        value={value}
                        subtitle={original.description}
                    />
                ),
                sortType: 'alphanumeric',
            },
            {
                Header: 'Created',
                accessor: 'createdAt',
                width: 150,
                Cell: DateCell,
                sortType: 'date',
            },
            {
                Header: 'Archived',
                accessor: 'archivedAt',
                width: 150,
                Cell: FeatureArchivedCell,
                sortType: 'date',
            },
            ...(!projectId
                ? [
                      {
                          Header: 'Project ID',
                          accessor: 'project',
                          sortType: 'alphanumeric',
                          filterName: 'project',
                          searchable: true,
                          maxWidth: 170,
                          Cell: ({ value }: any) => (
                              <LinkCell
                                  title={value}
                                  to={`/projects/${value}`}
                              />
                          ),
                      },
                  ]
                : []),
            {
                Header: 'Actions',
                id: 'Actions',
                align: 'center',
                maxWidth: 120,
                canSort: false,
                Cell: ({ row: { original: feature } }: any) => (
                    <ArchivedFeatureActionCell
                        project={feature.project}
                        onRevive={() => onRevive(feature.name)}
                        onDelete={() => {
                            setDeletedFeature(feature);
                            setDeleteModalOpen(true);
                        }}
                    />
                ),
            },
            // Always hidden -- for search
            {
                accessor: 'description',
                header: 'Description',
                searchable: true,
            },
        ],
        //eslint-disable-next-line
        [projectId, showEnvironmentLastSeen]
    );

    const {
        data: searchedData,
        getSearchText,
        getSearchContext,
    } = useSearch(columns, searchValue, archivedFeatures);

    const data = useMemo(
        () => (loading ? featuresPlaceholder : searchedData),
        [searchedData, loading]
    );

    const [initialState] = useState(() => ({
        sortBy: [
            {
                id: searchParams.get('sort') || storedParams.id,
                desc: searchParams.has('order')
                    ? searchParams.get('order') === 'desc'
                    : storedParams.desc,
            },
        ],
        hiddenColumns: ['description'],
        selectedRowIds: {},
    }));

    const getRowId = useCallback((row: any) => row.name, []);

    const {
        headerGroups,
        rows,
        state: { sortBy, selectedRowIds },
        prepareRow,
        setHiddenColumns,
        toggleAllRowsSelected,
    } = useTable(
        {
            columns: columns as any[], // TODO: fix after `react-table` v8 update
            data,
            initialState,
            sortTypes,
            autoResetHiddenColumns: false,
            autoResetSelectedRows: false,
            disableSortRemove: true,
            autoResetSortBy: false,
            getRowId,
        },
        useFlexLayout,
        useSortBy,
        useRowSelect
    );

    useConditionallyHiddenColumns(
        [
            {
                condition: isSmallScreen,
                columns: ['type', 'createdAt'],
            },
            {
                condition: isMediumScreen,
                columns: ['lastSeenAt', 'stale'],
            },
        ],
        setHiddenColumns,
        columns
    );

    useEffect(() => {
        if (loading) {
            return;
        }
        const tableState: Record<string, string> = {};
        tableState.sort = sortBy[0].id;
        if (sortBy[0].desc) {
            tableState.order = 'desc';
        }
        if (searchValue) {
            tableState.search = searchValue;
        }

        setSearchParams(tableState, {
            replace: true,
        });
        setStoredParams({ id: sortBy[0].id, desc: sortBy[0].desc || false });
    }, [loading, sortBy, searchValue]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <PageContent
                isLoading={loading}
                header={
                    <PageHeader
                        titleElement={`${title} (${
                            rows.length < data.length
                                ? `${rows.length} of ${data.length}`
                                : data.length
                        })`}
                        actions={
                            <Search
                                initialValue={searchValue}
                                onChange={setSearchValue}
                                hasFilters
                                getSearchContext={getSearchContext}
                            />
                        }
                    />
                }
            >
                <SearchHighlightProvider value={getSearchText(searchValue)}>
                    <VirtualizedTable
                        rows={rows}
                        headerGroups={headerGroups}
                        prepareRow={prepareRow}
                    />
                </SearchHighlightProvider>
                <ConditionallyRender
                    condition={rows.length === 0}
                    show={() => (
                        <ConditionallyRender
                            condition={searchValue?.length > 0}
                            show={
                                <TablePlaceholder>
                                    No feature toggles found matching &ldquo;
                                    {searchValue}&rdquo;
                                </TablePlaceholder>
                            }
                            elseShow={
                                <TablePlaceholder>
                                    None of the feature toggles were archived
                                    yet.
                                </TablePlaceholder>
                            }
                        />
                    )}
                />
                <ArchivedFeatureDeleteConfirm
                    deletedFeatures={[deletedFeature?.name!]}
                    projectId={projectId ?? deletedFeature?.project!}
                    open={deleteModalOpen}
                    setOpen={setDeleteModalOpen}
                    refetch={refetch}
                />
            </PageContent>
            <ConditionallyRender
                condition={Boolean(projectId)}
                show={
                    <BatchSelectionActionsBar
                        count={Object.keys(selectedRowIds).length}
                    >
                        <ArchiveBatchActions
                            selectedIds={Object.keys(selectedRowIds)}
                            projectId={projectId!}
                            onReviveConfirm={() => toggleAllRowsSelected(false)}
                        />
                    </BatchSelectionActionsBar>
                }
            />
        </>
    );
};
