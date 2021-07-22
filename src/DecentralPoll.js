import { useState } from 'react';
import { ethers } from 'ethers';
import DecentralPollContract from './artifacts/contracts/DecentralPoll.sol/DecentralPoll.json';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Decentral.Vote
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function ListItemLink(props) {
  return <ListItem button component="a" {...props} />;
}

function DecentralPoll() {
  const classes = useStyles();
  // store greeting in local state
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

  async function fetchPoll() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log("the signer", signer);
      const pollContract = new ethers.Contract(pollAddress, DecentralPollContract.abi, provider);
      try {
        let pollName = ethers.utils.parseBytes32String(await pollContract.getName());
        let props = await pollContract.getProposals();
        let startTime = new Date((await pollContract.getStartTime()).toNumber()*1000);
        let endTime = new Date((await pollContract.getEndTime()).toNumber()*1000);
        let hasPollStarted = await pollContract.hasPollStarted();
        let hasPollEnded = await pollContract.hasPollEnded();
        let voterCounts = await pollContract.getVoterCounts();
        let canVote = true; //await pollContract.canVote();
        let instanceData = {
          pollName: pollName,
          proposals: props,
          startTime: startTime,
          endTime: endTime,
          hasPollStarted: hasPollStarted,
          hasPollEnded: hasPollEnded,
          canVote: canVote,
          voterCounts: voterCounts
        };
        setPollInstance(instanceData);
        console.log('instance: ', instanceData);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  // call the smart contract, send a vote
  async function sendVote() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const pollContract = new ethers.Contract(pollAddress, DecentralPollContract.abi, signer);
      try {
        const transaction = await pollContract.vote(selectedVote);
        await transaction.wait();
        fetchPoll();
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

  function VoteList(props) {
    let counts = props.counts;
    let proposals = props.proposals;
    let items = counts.map((count, index) => {
      let label = `${ethers.utils.parseBytes32String(proposals[index])}`;
      let votes = `Votes: ${count.toString()}`;
      return <ListItemLink>
        <ListItemText primary={label} secondary={votes} />
      </ListItemLink>
    });
    return <List component="nav" aria-label="secondary mailbox folders">
      {items}
    </List>
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
      <Typography component="h1" variant="h5">
        Results
      </Typography>
      <VoteList counts={pollInstance.voterCounts} proposals={pollInstance.proposals} />
    </div>
  }

  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h3">
        Decentral.Vote
        </Typography>
        <form className={classes.form} noValidate>
        <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="pollAddress"
                label="Poll Address"
                name="pollAddress"
                value={pollAddress}
                onChange={e => setPollAddress(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={fetchPoll}
          >
            Fetch Poll
          </Button>
        </form>
        { details }
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}

export default DecentralPoll;
