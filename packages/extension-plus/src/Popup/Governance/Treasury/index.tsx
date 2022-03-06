// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import { BatchPrediction as BatchPredictionIcon, AccountBalance as AccountBalanceIcon, WhereToVote as WhereToVoteIcon } from '@mui/icons-material';
import { Grid, Tab, Tabs } from '@mui/material';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';

import { DeriveTreasuryProposals } from '@polkadot/api-derive/types';

import useMetadata from '../../../../../extension-ui/src/hooks/useMetadata';
import useTranslation from '../../../../../extension-ui/src/hooks/useTranslation';
import { PlusHeader, Popup, Progress } from '../../../components';
import getCurrentBlockNumber from '../../../util/api/getCurrentBlockNumber';
import { ChainInfo, Conviction, ProposalsInfo } from '../../../util/plusTypes';
import Proposals from './proposals/overview';

interface Props {
  chainName: string;
  showTreasuryModal: boolean;
  chainInfo: ChainInfo;
  setTreasuryModalOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Treasury({ chainInfo, chainName, setTreasuryModalOpen, showTreasuryModal }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState('proposals');
  const [proposals, setProposals] = useState<DeriveTreasuryProposals | undefined>();
  const [tips, setTips] = useState<ProposalsInfo | undefined | null>();
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number>();
  const chain = useMetadata(chainInfo?.genesisHash, true);// TODO:double check to have genesisHash here

  async function getIds(accountIds) {
    const accountInfo = await Promise.all(accountIds.map((i) => chainInfo.api.derive.accounts.info(i)));
    console.log('accountInfo:', accountInfo)
    return accountInfo;
  }


  useEffect(() => {
    chainInfo?.api.derive.treasury.proposals().then((p) => {
      setProposals(p);

      const ids = [];

      ids.push(ids.concat(p.approvals.map((i) => [i.proposal.proposer, i.proposal.beneficiary])))
      console.log('tresury: ', p)
      console.log('ids: ', ids)

    }).catch(console.error);


    // eslint-disable-next-line no-void
    void getCurrentBlockNumber(chainName).then((n) => {
      setCurrentBlockNumber(n);
    });
  }, [chainInfo, chainName]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  }, []);

  const handleTreasuryModalClose = useCallback((): void => {
    setTreasuryModalOpen(false);
  }, [setTreasuryModalOpen]);

  return (
    <Popup handleClose={handleTreasuryModalClose} showModal={showTreasuryModal}>
      <PlusHeader action={handleTreasuryModalClose} chain={chainName} closeText={'Close'} icon={<AccountBalanceIcon fontSize='small' />} title={'Treasury'} />
      <Grid container>
        <Grid item sx={{ margin: '0px 30px' }} xs={12}>
          <Tabs indicatorColor='secondary' onChange={handleTabChange} textColor='secondary' value={tabValue} variant='fullWidth'>
            <Tab icon={<WhereToVoteIcon fontSize='small' />} iconPosition='start' label='Proposals' sx={{ fontSize: 11 }} value='proposals' />
            <Tab icon={<BatchPredictionIcon fontSize='small' />} iconPosition='start' label='Tips' sx={{ fontSize: 11 }} value='tips' />
          </Tabs>
        </Grid>

        {tabValue === 'proposals'
          ? <Grid item sx={{ height: 450, overflowY: 'auto' }} xs={12}>
            {proposals !== undefined
              ? <Proposals chain={chain} chainInfo={chainInfo} currentBlockNumber={currentBlockNumber} proposalsInfo={proposals} />
              : <Progress title={'Loading proposals ...'} />}
          </Grid>
          : ''}

        {tabValue === 'tips'
          ? <Grid item sx={{ height: 450, overflowY: 'auto' }} xs={12}>
            {/* {tips !== undefined
              ? <Proposals chain={chain} chainInfo={chainInfo} tips={tips} />
              : <Progress title={'Loading tips ...'} />} */}
          </Grid>
          : ''}
      </Grid>
    </Popup>
  );
}
