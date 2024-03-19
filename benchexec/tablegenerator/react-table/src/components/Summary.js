// This file is part of BenchExec, a framework for reliable benchmarking:
// https://github.com/sosy-lab/benchexec
//
// SPDX-FileCopyrightText: 2019-2020 Dirk Beyer <https://www.sosy-lab.org>
//
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useState } from "react";
import { useFlexLayout, useResizeColumns, useTable } from "react-table";
import { statisticsRows } from "../utils/stats";
import { SelectColumnsButton } from "./TableComponents";
import NewStatisticsTable from "./NewStatisticsTable";

const infos = [
  "displayName",
  "tool",
  "limit",
  "host",
  "os",
  "system",
  "date",
  "runset",
  "branch",
  "options",
  "property",
];

const Summary = (props) => {
  const [isTitleColSticky, setTitleColSticky] = useState(true);

  /* ++++++++++++++ Helper functions ++++++++++++++ */
  const renderOptions = (text) => {
    return text.split(/[\s]+-/).map((option, i) => (
      <li
        key={option}
        style={{ textAlign: "left", fontSize: "9pt", listStyle: "none" }}
      >
        <code>{i === 0 ? option : `-${option}`}</code>
      </li>
    ));
  };

  const externalLink = (url, text) => {
    if (url) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
    } else {
      return text;
    }
  };

  const renderToolNameAndVersion = ({
    tool,
    version,
    project_url,
    version_url,
  }) => {
    return (
      <>
        {externalLink(project_url, tool)} {externalLink(version_url, version)}
      </>
    );
  };

  /* ++++++++++++++ Table render functions ++++++++++++++ */

  // const renderRow = (row, text, colSpan, j) => {
  //   const isOptionRow = row === "options";
  //   const isToolRow = row === "tool";
  //   return (
  //     <td
  //       colSpan={colSpan}
  //       key={text + j}
  //       className={`header__tool-row${isOptionRow && " options"}`}
  //     >
  //       {isOptionRow ? (
  //         <ul>{renderOptions(text)}</ul>
  //       ) : isToolRow ? (
  //         renderToolNameAndVersion(text)
  //       ) : (
  //         text
  //       )}
  //     </td>
  //   );
  // };

  const BenchmarkCols = useMemo(() => {
    let colArray = [];

    infos.forEach((row) => {
      let tableHeaderRow = props.tableHeader[row];
      if (tableHeaderRow) {
        colArray.push({
          accessor: tableHeaderRow.id,
          Header: tableHeaderRow.name,
          minWidth: 280,
          sticky: "left",
        });
      }
    });

    colArray.push({
      Header: (
        <div style={{ height: 38 }}>
          <SelectColumnsButton handler={() => {}} />
        </div>
      ),
      id: "columnselect",
      accessor: "columnselect",
      minWidth: 100,
      statisticTable: true,
    });

    for (const stat in props.stats) {
      if (props.stats[stat].title) {
        colArray.push({
          Header: props.stats[stat].title,
          stats: true,
        });
      } else {
        colArray.push({
          Header:
            "\xa0".repeat(4 * statisticsRows[props.stats[stat].id].indent) +
            statisticsRows[props.stats[stat].id].title,
          stats: true,
        });
      }
    }

    return colArray;
  }, [props.tableHeader, props.stats]);

  const BenchmarkData = useMemo(() => {
    let dataArray = [];

    props.tools.forEach((runSet, runSetIndex) => {
      dataArray.push({
        colspan: {
          columnselect: props.tableHeader.tool.content[runSetIndex][1],
        },
        columnselect: {
          runSet,
          runSetIndex: runSetIndex,
          runSetStats: props.stats,
        },
      });
    });

    infos.forEach((row) => {
      let tableHeaderRow = props.tableHeader[row];
      if (tableHeaderRow) {
        tableHeaderRow.content.forEach((cont, index) => {
          let dataElement = dataArray[index];
          dataArray[index] = {
            ...dataElement,
            [tableHeaderRow.id]: cont[0],
            colspan: { ...dataElement.colspan, [tableHeaderRow.id]: cont[1] },
          };
        });
      }
    });

    return dataArray;
  }, [props.tableHeader, props.tools, props.stats]);

  const { getTableProps, getTableBodyProps, headers, rows, prepareRow } =
    useTable(
      { columns: BenchmarkCols, data: BenchmarkData },
      useFlexLayout,
      useResizeColumns,
    );

  return (
    <div id="summary">
      <h2>Benchmark Setup</h2>
      <div id="benchmark_setup">
        <form id="stickyform">
          <label title="Fix the first column" htmlFor="fixed-row-title">
            Fixed row title:
          </label>
          <input
            id="fixed-row-title"
            name="fixed"
            type="checkbox"
            style={{ width: 20, height: 20 }}
            checked={isTitleColSticky}
            onChange={({ target }) => setTitleColSticky(target.checked)}
          />
        </form>
        {/* Benchmark Setup Table using react-table  */}
        <table {...getTableProps()} style={{ border: "1px solid black" }}>
          <tbody {...getTableBodyProps()}>
            {headers.map((col, index) => {
              return (
                <tr key={index}>
                  <th
                    {...col.getHeaderProps()}
                    className={`${isTitleColSticky && "sticky"}`}
                  >
                    {col.render("Header")}
                    <div
                      {...col.getResizerProps()}
                      style={{
                        cursor: "col-resize",
                        display: "inline-block",
                        background: "gray",
                        width: "2px",
                        height: "100%",
                        position: "absolute",
                        right: 0,
                        top: 0,
                        zIndex: 1,
                        // transform: "translateX(50%)",
                      }}
                    />
                  </th>
                  {!col.stats &&
                    rows.map((row, index) => {
                      prepareRow(row);
                      if (row.values[col.id] === undefined) {
                        return null;
                      }
                      return (
                        <td
                          key={index}
                          colSpan={
                            (row.original.colspan &&
                              row.original.colspan[col.id]) ||
                            1
                          }
                          rowSpan={col.id === "columnselect" ? infos.length : 1}
                          style={{ padding: col.id === "columnselect" && 0 }}
                        >
                          {col.id === "columnselect" ? (
                            <NewStatisticsTable
                              key={index}
                              tableData={row.values[col.id]}
                              switchToQuantile={props.switchToQuantile}
                            />
                          ) : col.id === "options" ? (
                            <ul style={{ margin: 0, paddingLeft: 17 }}>
                              {renderOptions(row.values[col.id])}
                            </ul>
                          ) : col.id === "tool" ? (
                            renderToolNameAndVersion(row.values[col.id])
                          ) : (
                            row.values[col.id]
                          )}
                        </td>
                      );
                    })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Benchmark HTML table */}
        {/* <table >
          <tbody>
            {infos
              .map((row) => props.tableHeader[row])
              .filter((row) => row !== null)
              .map((row) => (
                <tr key={"tr-" + row.id} className={row.id}>
                  <th key={"td-" + row.id}>{row.name}</th>
                  {row.content.map((tool, j) =>
                    renderRow(row.id, tool[0], tool[1], j),
                  )}
                </tr>
              ))}
          </tbody>
        </table> */}
      </div>
      {/* <StatisticsTable
        selectColumn={props.selectColumn}
        tools={props.tools}
        switchToQuantile={props.switchToQuantile}
        hiddenCols={props.hiddenCols}
        tableData={props.tableData}
        onStatsReady={props.onStatsReady}
        stats={props.stats}
        filtered={props.filtered}
      /> */}
      <p>
        Generated by{" "}
        <a
          className="link"
          href="https://github.com/sosy-lab/benchexec"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          BenchExec {props.version}
        </a>
      </p>
    </div>
  );
};

export default Summary;
