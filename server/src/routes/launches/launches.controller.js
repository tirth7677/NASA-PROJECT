const { getAllLaunches, scheduleNewLaunch, existedlaunchwithID, abortLaunchbyID } = require("../../models/launches.model");
const {getpagination} = require('../../services/query')

// The Array.from() static method creates a new, shallow-copied Array instance from an iterable or array-like object.
async function httpgetAllLaunches(req, res) {
  // for pagination we can take query like this http://localhost:8000/v1/launches?limit=50&page=1
  // console.log(req.query);
  // const {page,limit} = req.query
  const {skip,limit} = getpagination(req.query);
  const launches = await getAllLaunches(skip,limit)
  return res.status(200).json(launches);
}

async function httpaddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target 
  ) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }
  await scheduleNewLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req,res){
    const launchID = parseInt(req.params.id);
    const existLaunch = await existedlaunchwithID(launchID);
    if(!existLaunch){
        res.status(404).json({
            error: 'Launch not found',
        });
    }
    const aborted = abortLaunchbyID(launchID);
    return res.status(200).json({
      ok:true,
    });
}
module.exports = {
  httpgetAllLaunches,
  httpaddNewLaunch,
  httpAbortLaunch,
};