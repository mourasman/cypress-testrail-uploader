const axios = require('axios');

module.exports = function CypressTestRailUploader(options) {
  this.testrailUrl = options.testrailUrl;
  this.username = options.username;
  this.password = options.password;
  this.projectId = options.projectId;
  this.suiteId = options.suiteId;

  function getStatusId(state) {
    switch (state.toLowerCase()) {
      case 'passed':
        return 1;
      case 'failed':
        return 5;
      case 'skipped':
        return 6;
      default:
        return 3;
    }
  }

  function getTestrailResults(runs) {
    const results = [];

    runs.forEach((run) => {
      run.tests.forEach((test) => {
        results.push({
          case_id: test.title[test.title.length - 1].match(/C\d+$/)[0],
          status_id: getStatusId(test.state),
          comment: `${test.title}
${test.err}`,
        });
      });
    });

    return results;
  }

  function post(api, body, callback) {
    return axios.post(`${this.testrailUrl}?api/v2/${api}`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).then((res) => {
      if (res.status !== 200) {
        console.log('Error: %s', JSON.stringify(res.data));

        throw new Error(res.data);
      }

      return callback(res.data);
    });
  }

  this.upload = function upload(runs, name, description) {
    const testrailResults = getTestrailResults(runs);

    console.log(`Publishing ${testrailResults.length} test result(s) to ${this.testrailUrl}`);

    return post(`add_run/${this.options.projectId}`, {
      suite_id: this.options.suiteId,
      name,
      description,
      assignedto_id: this.options.assignedToId,
      include_all: true,
    }, (body) => {
      const runId = body.id;
      console.log(`Results published to ${this.testrailUrl}?/runs/view/${runId}`);
      return post(`add_results_for_cases/${runId}`, {
        results: testrailResults,
      });
    });
  }
};
