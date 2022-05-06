// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description This component shows my selected pool's information 
 *
 * */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { Chain } from '../../../../../extension-chains/src/types';
import type { AccountsBalanceType, MyPoolInfo, PoolInfo } from '../../../util/plusTypes';

import { StopRounded as StopRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useEffect, useState } from 'react';

import useTranslation from '../../../../../extension-ui/src/hooks/useTranslation';
import { Progress, ShowAddress } from '../../../components';

interface Props {
  chain: Chain;
  api: ApiPromise | undefined;
  poolsInfo: PoolInfo[] | undefined;
  staker: AccountsBalanceType;
  myPool: MyPoolInfo | undefined | null;
}

export default function PoolTab({ api, chain, myPool, poolsInfo, staker }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [points, setPoints] = useState<Balance | undefined>();

  useEffect(() => {
    if (!(api && poolsInfo && myPool)) return;

    const poolPoints = (poolsInfo[myPool.poolId.subn(1)]?.bondedPools?.points ?? 0) as number;

    setPoints(api.createType('Balance', poolPoints));
  }, [api, myPool, poolsInfo]);

  return (
    <Grid container sx={{ px: '25px' }}>
      {poolsInfo && api
        ? myPool
          ? <>
            <Paper elevation={2} sx={{ backgroundColor: grey[600], borderRadius: '5px', color: 'white', p: '5px 0px 5px 10px', width: '100%' }}>
              <Grid alignItems='center' container id='header' sx={{ fontSize: 11 }}>
                <Grid item sx={{ textAlign: 'left' }} xs={1}>
                  {t('Index')}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={4}>
                  {t('Name')}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={1}>
                  {t('State')}
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={3}>
                  {t('Balance')}
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={2}>
                  {t('Members')}
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={1}>
                  {t('Action')}
                </Grid>
              </Grid>
            </Paper>

            {myPool &&
              <Paper elevation={2} sx={{ backgroundColor: grey[100], mt: '4px', p: '1px 0px 2px 10px', width: '100%' }}>
                <Grid alignItems='center' container sx={{ fontSize: 12 }}>
                  <Grid item sx={{ textAlign: 'center' }} xs={1}>
                    {myPool.poolId.toNumber()}
                  </Grid>
                  <Grid item sx={{ textAlign: 'left' }} xs={4}>
                    {myPool.metadata ?? t('no name')}
                  </Grid>
                  <Grid item sx={{ textAlign: 'left' }} xs={1}>
                    {myPool.bondedPools.state}
                  </Grid>
                  <Grid item sx={{ textAlign: 'center' }} xs={3}>
                    {points?.toHuman()}
                  </Grid>
                  <Grid item sx={{ textAlign: 'center' }} xs={2}>
                    {myPool.bondedPools.memberCounter}
                  </Grid>
                  <Grid item justifyContent='center' sx={{ textAlign: 'center' }} xs={1}>
                    <StopRoundedIcon color='warning' fontSize='small' sx={{ cursor: 'pointer' }} />
                  </Grid>
                </Grid>
              </Paper>
            }

            <Grid item sx={{ pt: 1 }} xs={12}>
              <Paper elevation={3}>
                <Grid container item justifyContent='flex-start' sx={{ fontSize: 12, p: '10px', textAlign: 'center' }}>
                  <Grid item xs={12}>
                    <ShowAddress address={myPool.bondedPools.roles.root} chain={chain} role={'Root'} />
                  </Grid>
                  <Grid item xs={12}>
                    <ShowAddress address={myPool.bondedPools.roles.depositor} chain={chain} role={'Depositor'} />
                  </Grid>
                  <Grid item xs={12}>
                    <ShowAddress address={myPool.bondedPools.roles.nominator} chain={chain} role={'Nominator'} />
                  </Grid>
                  <Grid item xs={12}>
                    <ShowAddress address={myPool.bondedPools.roles.stateToggler} chain={chain} role={'State Toggler'} />
                  </Grid>
                  <Grid item xs={12}>
                    <ShowAddress address={myPool.accounts.stashId} chain={chain} role={'Stash id'} />
                  </Grid>
                  <Grid item xs={12}>
                    <ShowAddress address={myPool.accounts.rewardId} chain={chain} role={'Reward id'} />
                  </Grid>

                  <Grid item sx={{ p: '0px 0px 10px' }} xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item sx={{ pb: 1, textAlign: 'left' }} xs={4}>
                    {t('Balance')}{': '}{myPool.rewardPools.balance}
                  </Grid>
                  <Grid item sx={{ pb: 1, textAlign: 'left' }} xs={4}>
                    {t('Points')}{': '}{myPool.rewardPools.points}
                  </Grid>
                  <Grid item sx={{ pb: 1, textAlign: 'left' }} xs={4}>
                    {t('Total earnings')}{': '}{myPool.rewardPools.totalEarnings}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </>
          : <Grid item sx={{ fontSize: 12, textAlign: 'center', pt: 7 }} xs={12}>
            {t('No active pool found')}
          </Grid>
        : <Progress title={t('Loading ...')} />
      }
    </Grid>

  );
}
