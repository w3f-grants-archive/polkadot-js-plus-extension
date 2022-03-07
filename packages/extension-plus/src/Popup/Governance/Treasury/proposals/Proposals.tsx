// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountInfo, DeriveTreasuryProposal } from '@polkadot/api-derive/types';

import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import { Avatar, Button, Divider, Grid, Link, Paper } from '@mui/material';
import { deepOrange, grey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

import { Chain } from '../../../../../../extension-chains/src/types';
import useTranslation from '../../../../../../extension-ui/src/hooks/useTranslation';
import Identity from '../../../../components/Identity';
import getLogo from '../../../../util/getLogo';
import { ChainInfo } from '../../../../util/plusTypes';
import { amountToHuman } from '../../../../util/plusUtils';

interface Props {
  proposals: DeriveTreasuryProposal[] | null;
  chain: Chain;
  chainInfo: ChainInfo;
  title: string
  showSubmit?: boolean;
  handleSubmitProposal?: () => void;
}

export default function Proposals({ chain, chainInfo, handleSubmitProposal, proposals, showSubmit, title }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chainName = chain?.name.replace(' Relay Chain', '');
  const [identities, setIdentities] = useState<DeriveAccountInfo[]>();

  if (!proposals) return (<></>);

  useEffect(() => {
    const ids = proposals.map((i) => [i.proposal.proposer, i.proposal.beneficiary]).flat();

    Promise.all(ids.map((i) => chainInfo.api.derive.accounts.info(i))).then((infos) => {
      setIdentities(infos);
    }).catch(console.error);
  }, [chainInfo, proposals]);

  return (
    <>
      <Grid container justifyContent='flex-start' xs={12}>
        <Grid sx={{ color: grey[600], fontFamily: 'fantasy', fontSize: 15, fontWeigth: 'bold', p: '10px 30px 10px', textAlign: 'left' }} xs={4}>
          {showSubmit &&
            <Button onClick={handleSubmitProposal} size='small' startIcon={<AddCircleRoundedIcon />} color='warning' variant='outlined'>
              {t('Submit')}
            </Button>
          }
        </Grid>
        <Grid sx={{ color: grey[600], fontFamily: 'fantasy', fontSize: 15, fontWeigth: 'bold', p: '10px 30px 10px', textAlign: 'center' }} xs={4}>
          {title}
        </Grid>
      </Grid>

      {proposals?.length
        ? proposals.map((p, index) => {
          const proposerAccountInfo = identities?.find((i) => i.accountId.toString() === p.proposal.proposer.toString());
          const beneficiaryAccountInfo = identities?.find((i) => i.accountId.toString() === p.proposal.beneficiary.toString());

          return (
            <Paper elevation={4} key={index} sx={{ borderRadius: '10px', margin: '20px 30px 10px', p: '10px 20px' }}>
              <Grid alignItems='center' container justifyContent='space-between'>
                <Grid item>
                  <Avatar sx={{ bgcolor: 'black', fontSize: 14, height: 30, width: 30 }}>
                    {String(p?.id)}
                  </Avatar>
                </Grid>
                <Grid item sx={{ fontSize: 12 }}>
                  {t('Payment')}{': '}{amountToHuman(String(p?.proposal.value), chainInfo?.decimals)} {chainInfo.coin}
                </Grid>
                <Grid item sx={{ fontSize: 12 }}>
                  {t('Bond')}{': '}{amountToHuman(String(p?.proposal.bond), chainInfo?.decimals)} {chainInfo.coin}
                </Grid>

              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid container item justifyContent='flex-end' spacing={1} xs={12}>
                <Grid item>
                  <Link
                    href={`https://dotreasury.com/${chainInfo?.coin}/proposals/${p?.id}`}
                    rel='noreferrer'
                    target='_blank'
                    underline='none'
                  >
                    <Avatar
                      alt={'dotreasury'}
                      src={getLogo('dotreasury')}
                      sx={{ height: 15, width: 15 }}
                    />
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href={`https://${chainName}.polkassembly.io/treasury/${p?.id}`}
                    rel='noreferrer'
                    target='_blank'
                    underline='none'
                  >
                    <Avatar
                      alt={'Polkassembly'}
                      src={getLogo('polkassembly')}
                      sx={{ height: 15, width: 15 }}
                    />
                  </Link>
                </Grid>
                <Grid item>
                  <Link
                    href={`https://${chainName}.subscan.io/treasury/${p?.id}`}
                    rel='noreferrer'
                    target='_blank'
                    underline='none'
                  >
                    <Avatar
                      alt={'subscan'}
                      src={getLogo('subscan')}
                      sx={{ height: 15, width: 15 }}
                    />
                  </Link>
                </Grid>
              </Grid>

              <Grid item sx={{ fontSize: 12, pt: 1, textAlign: 'left' }} xs={12}>
                {p?.proposal.proposer &&
                  <Identity accountInfo={proposerAccountInfo} chain={chain} showAddress title={t('Proposer')} />
                }
              </Grid>

              <Grid item sx={{ fontSize: 12, pt: 1, textAlign: 'left' }} xs={12}>
                {p?.proposal.beneficiary &&
                  <Identity accountInfo={beneficiaryAccountInfo} chain={chain} showAddress title={t('Beneficiary')} />
                }
              </Grid>
            </Paper>);
        })
        : <Grid sx={{ fontSize: 12, p: 2, textAlign: 'center' }} xs={12}>
          {t('No proposal')}
        </Grid>}
    </>
  );
}
