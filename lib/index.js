const axios = require('axios');

module.exports = function CypressTestRailUploader(options) {
  this.base = `https://${options.domain}/index.php`;
  this.domain = options.domain;
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
          case_id: test.title[test.title.length - 1].match(/C(\d+)$/)[1],
          status_id: getStatusId(test.state),
          comment: `${test.title}
${test.err}`,
        });
      });
    });

    return results;
  }

  function post(api, body, callback) {
    return axios.post(`${this.base}?api/v2/${api}`, body, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth: {
        username: this.username,
        password: this.password,
      },
    }).then((res) => {
      if (res.status !== 200) {
        console.log('Error: %s', JSON.stringify(res.data));

        throw new Error(res.data);
      }

      if (typeof callback === 'function') {
        return callback(res.data);
      }
    });
  }

  this.upload = function upload(runs, name, description) {
    const testrailResults = getTestrailResults(runs);

    console.log(`Publishing ${testrailResults.length} test result(s) to ${this.base}`);

    return post.call(this, `add_run/${this.projectId}`, {
      suite_id: this.suiteId,
      name,
      description,
      assignedto_id: this.assignedToId,
      include_all: true,
    }, (body) => {
      const runId = body.id;
      console.log(`Results published to ${this.base}?/runs/view/${runId}`);
      return post.call(this, `add_results_for_cases/${runId}`, {
        results: testrailResults,
      });
    });
  };
};
