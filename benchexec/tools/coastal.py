# This file is part of BenchExec, a framework for reliable benchmarking:
# https://github.com/sosy-lab/benchexec
#
# SPDX-FileCopyrightText: 2007-2020 Dirk Beyer <https://www.sosy-lab.org>
#
# SPDX-License-Identifier: Apache-2.0

import benchexec.util as util
import benchexec.tools.template
import benchexec.result as result


class Tool(benchexec.tools.template.BaseTool):
    """
    Tool info for COASTAL
    """

    REQUIRED_PATHS = ["coastal", "coastal-sv-comp"]

    def executable(self):
        return util.find_executable("coastal-sv-comp")

    def name(self):
        return "COASTAL"

    def project_url(self):
        return "http://www.cs.sun.ac.za/coastal/"

    def version(self, executable):
        output = self._version_from_tool(executable, arg="--version")
        first_line = output.splitlines()[0]
        return first_line.strip()

    def cmdline(self, executable, options, tasks, propertyfile, rlimits):
        options = options + ["--propertyfile", propertyfile]
        return [executable] + options + tasks

    def determine_result(self, returncode, returnsignal, output, isTimeout):
        # parse output
        status = result.RESULT_UNKNOWN

        for line in output:
            if "UNSAFE" in line:
                status = result.RESULT_FALSE_PROP
            elif "SAFE" in line:
                status = result.RESULT_TRUE_PROP

        return status
