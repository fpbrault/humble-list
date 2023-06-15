import React, { useMemo, useEffect, useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import Link from 'next/link';
import useSWR, { SWRConfig } from 'swr'
import { saveUserSettings, getUserSettings } from '../lib/user';


const fetcher = (url) => fetch(url).then((res) => res.json());

const customSortFunction = (rowA, rowB) => {
  const sortOrder = ["*****", "****", "***", "**", "*", "-", "???", ""];

  const valueA = rowA.values.review_score;
  const valueB = rowB.values.review_score;

  const indexA = sortOrder.indexOf(valueA);
  const indexB = sortOrder.indexOf(valueB);

  // Compare the indexes to determine the sort order
  if (indexA < indexB) {
    return -1;
  } else if (indexA > indexB) {
    return 1;
  } else {
    return 0;
  }
};

const Table = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy
  );

  return (
    <div>
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="table table-xs">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr key={headerGroup} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th key={column}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={column.isSorted ? (column.isSortedDesc ? 'desc' : 'asc') : ''}
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr key={row} {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td key={cell} {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table></div> </div>
  );
};

const Home = () => {
  const { data, error, isLoading } = useSWR('api/games', fetcher)
  const [themeName, setThemeName] = useState('coffee');
  const [viewMode, setViewMode] = useState('detailed');
  const [loaded, setLoaded] = useState(false);

  // Load the user settings from local storage on component mount
  useEffect(() => {
    const settings = getUserSettings();
    if (settings) {
      setThemeName(settings.themeName);
      setViewMode(settings.viewMode);
      setLoaded(true); // Set loaded flag to true
    }
  }, []);

  // Save the user settings to local storage whenever they change
  useEffect(() => {
    if (loaded) {
      saveUserSettings({ themeName, viewMode });
    }
  }, [themeName, viewMode, loaded]);


  const columns = useMemo(
    () => viewMode == "detailed" ? [
      {
        Header: 'ID',
        Cell: ({ value, row }) => (
          <span className="font-bold sm:text-xl">
            {row.index + 1}
          </span>
        ),
      },
      {
        Header: 'Game Name',
        accessor: 'game_name',
        Cell: ({ value, row }) => (
          <div tabIndex={0} className="collapse collapse-arrow">
            <input type="checkbox" />
            <div className="text-xl font-medium collapse-title">
              <a target="_blank" className={" link link-primary link-hover font-bold text-lg" + (row.original.available === "false" ? " line-through" : "")} href={row.original.game_url}>
                {value}
              </a></div>
            <div className="collapse-content">
              <ul className='p-4 m-2 space-y-1 text-lg border rounded-lg border-base-200 bg-base-300 text-primary'>
                <li>Price: <span className='text-xl font-bold'>{row.original.game_price}</span></li>
                <li>Genre: <span className='text-xl font-bold'>{row.original.genre}</span></li>
                <li>Release Date: <span className='text-xl font-bold'>{row.original.release_date}</span></li>
                <li className='py-4'><span className='text-lg'>{row.original.description}</span>
                </li>
                <li>{row.original.tags.length ? row.original.tags.sort().map((tag) => (<span key={tag} className='badge badge-primary p-2 mx-1 my-0.5'>{tag}</span>)) : null}</li>
              </ul>


            </div></div>
        ),
      },

      {
        Header: 'Score',
        accessor: 'review_score',
        Cell: ({ value, row }) => {
          return (
            <div className="font-black sm:text-lg">
              {value ? value : '???'}
            </div>
          )
        },
        sortType: customSortFunction,
      },
    ] : [
      {
        Header: 'Index',
        Cell: ({ value, row }) => (
          <span className="font-bold sm:text-xl">
            {row.index + 1}
          </span>
        ),
      },
      {
        Header: 'Game Name',
        accessor: 'game_name',
        Cell: ({ value, row }) => (
          <a target="_blank" className={"link link-primary link-hover font-bold text-lg" + (row.original.available === "false" ? " line-through" : "")} href={row.original.game_url}>
            {value}
          </a>
        ),
      },
      {
        Header: 'Score',
        accessor: 'review_score',
        Cell: ({ value, row }) => {
          return (
            <div className="font-black sm:text-lg">
              {value ? value : '???'}
            </div>
          )
        },
        sortType: customSortFunction,
      },
      {
        Header: 'Price',
        accessor: 'game_price',
      },
      {
        Header: 'Genre',
        accessor: 'genre',
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: ({ value }) => (
          <div className="px-2 py-1 overflow-y-auto text-xs rounded-lg max-h-16 bg-base-300 w-96">
            <span className="description-text">{value}</span>
          </div>
        ),
      },
      {
        Header: 'Tags',
        accessor: 'tags',
        Cell: ({ value }) => (
          <div className="h-16 overflow-auto tags">
            {value.length ? (value.map((tag) => (
              <div
                key={tag}
                className="m-0.5 p-1 badge badge-sm badge-primary"
              >
                {tag}
              </div>
            ))) : null}
          </div>
        ),
      },
      {
        Header: 'Release Date',
        accessor: 'release_date',
      },
    ],
    [viewMode]
  );

  const changeTheme = () => {
    setThemeName(themeName === "coffee" ? "light" : "coffee")
  }

  const changeMode = () => {
    setViewMode(viewMode === "compact" ? "detailed" : "compact")
  }

  const Layout = ({ children }) => (
    <div className='h-full' data-theme={themeName}>
      <h1 className='p-4 text-4xl font-bold text-center bg-primary text-primary-content'>Steam Games </h1>

      <div className='flex justify-center gap-4 py-4 bg-base-200'>
        <button onClick={changeMode} className='text-xl text-center link'>{viewMode === "detailed" ? "Detailed View" : "Compact View"}</button>
        <label className="swap swap-rotate">

          {/* this hidden checkbox controls the state */}
          <input type="checkbox" onClick={changeTheme} />

          {/* sun icon */}
          <svg className="w-10 h-10 fill-current swap-on" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>

          {/* moon icon */}
          <svg className="w-10 h-10 fill-current swap-off" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>

        </label>
      </div>
      {children}
    </div>
  )

  if (error) return <Layout>failed to load</Layout>

  if (isLoading) return <Layout ><div className="flex justify-center h-full "><span className="loading loading-spinner loading-lg"></span></div></Layout>

  return (
    <Layout>
      <Table
        columns={columns}
        data={data}
      />
    </Layout>
  );
};

export default Home;
