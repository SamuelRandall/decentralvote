import { useState } from 'react';
import React from 'react';
import { ethers } from 'ethers';
import DecentralPollContract from '../artifacts/contracts/DecentralPoll.sol/DecentralPoll.json';
import VoteCounts from './VoteCounts';
import PollLookup from './PollLookup';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';

const steps = ['Poll Lookup', 'Poll Details', 'Submit Vote'];

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
}));

function Vote() {
  const classes = useStyles();

  const [
    pollInstance,
    setPollInstance,
  ] = useState({
    pollName: "",
    proposals: [],
    startTime: "",
    endTime: "",
    hasPollStarted: false,
    hasPollEnded: false,
    canVote: false,
    voterCounts: []
  });

  const [
    pollAddress,
    setPollAddress,
  ] = useState("");

  const [
    selectedVote,
    setSelectedVote,
  ] = useState(null);

  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  function getStepContent(step) {
    switch (step) {
      case 0:
        return <PollLookup pollAddress={pollAddress} />;
      case 1:
        return <PollLookup />;
      case 2:
        return <PollLookup />;
      default:
        throw new Error('Unknown step');
    }
  }



  // request access to the user's MetaMask account


  // call the smart contract, send a vote
  async function sendVote() {
    if (typeof window.ethereum !== 'undefined') {
      // await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const pollContract = new ethers.Contract(pollAddress, DecentralPollContract.abi, signer);
      try {
        const transaction = await pollContract.vote(selectedVote);
        await transaction.wait();
        // fetchPoll();
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  function ProposalList(props) {
    const proposals = props.proposals;
    return proposals.map((proposal, index) =>
      <FormControlLabel value={index} control={<Radio />} label={ethers.utils.parseBytes32String(proposal)} />
    );
  }

  let details;
  if (pollInstance.proposals.length) {
    details = <div>
      <Paper variant="outlined" style={{ padding: "16px" }}>
        <Typography component="h2" variant="h6">
          Poll Name
        </Typography>
        <Typography component="h3" variant="h7">
          {pollInstance.pollName}
        </Typography>
        <Typography component="h2" variant="h6">
          Start Time
        </Typography>
        <Typography component="h3" variant="h7">
          {pollInstance.startTime.toString()}
        </Typography>
        <Typography component="h2" variant="h6">
          End Time
        </Typography>
        <Typography component="h3" variant="h7">
          {pollInstance.endTime.toString()}
        </Typography>
      </Paper>
      <h3>
        Has Started?
        {pollInstance.hasPollStarted ? " Yes" : " No"}
      </h3>
      <h3>
        Has Ended?
        {pollInstance.hasPollEnded ? " Yes" : " No"}
      </h3>
      <h3>Can Vote: {pollInstance.canVote ? " Yes" : " No"}</h3>

      <FormControl component="fieldset">
        <FormLabel component="legend">Proposals</FormLabel>
        <RadioGroup
          aria-label="proposals"
          name="proposals"
          value={selectedVote}
          onChange={e => setSelectedVote(e.target.value)}>
          <ProposalList proposals={pollInstance.proposals} />
        </RadioGroup>
      </FormControl>
      <h3>You chose: {selectedVote}</h3>
      <Button variant="contained" color="primary" onClick={sendVote}>
        Vote!
      </Button>
      <VoteCounts counts={pollInstance.voterCounts} proposals={pollInstance.proposals} />
    </div>
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center">
        Vote
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <React.Fragment>
            <Typography variant="h5" gutterBottom>
              Thank you for your order.
            </Typography>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {getStepContent(activeStep)}
            <div className={classes.buttons}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} className={classes.button}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
              </Button>
            </div>
          </React.Fragment>
        )}
      </React.Fragment>
    </React.Fragment>
  );

  // return (
  //   <Container maxWidth="sm">
  //     <div className={classes.paper}>
  //       <form className={classes.form} noValidate>
  //       <Grid container spacing={2}>
  //           <Grid item xs={12}>
  //             <TextField
  //               variant="outlined"
  //               required
  //               fullWidth
  //               id="pollAddress"
  //               label="Poll Address"
  //               name="pollAddress"
  //               value={pollAddress}
  //               onChange={e => setPollAddress(e.target.value)}
  //             />
  //           </Grid>
  //         </Grid>
  //         <Button
  //           fullWidth
  //           variant="contained"
  //           color="primary"
  //           className={classes.submit}
  //           onClick={fetchPoll}
  //         >
  //           Fetch Poll
  //         </Button>
  //       </form>
  //       { details }
  //     </div>
  //   </Container>
  // );
}

export default Vote;
