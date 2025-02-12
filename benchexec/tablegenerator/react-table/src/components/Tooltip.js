// This file is part of BenchExec, a framework for reliable benchmarking:
// https://github.com/sosy-lab/benchexec
//
// SPDX-FileCopyrightText: 2019-2020 Dirk Beyer <https://www.sosy-lab.org>
//
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const IconWithTooltip = ({ message }) => {
  return (
    <div className="infoTooltipContainer">
      <FontAwesomeIcon icon={faInfoCircle} className="infoTooltipIcon" />
      <span className="infoTooltip">{message}</span>
    </div>
  );
};

export default IconWithTooltip;
