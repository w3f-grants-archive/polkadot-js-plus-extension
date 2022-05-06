// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 *
 * */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';
import type { FrameSystemAccountInfo, PalletNominationPoolsBondedPoolInner, PalletNominationPoolsPoolMember, PalletNominationPoolsRewardPool, PalletStakingNominations } from '@polkadot/types/lookup';
import type { Chain } from '../../../../../extension-chains/src/types';
import type { AccountsBalanceType, MyPoolInfo } from '../../../util/plusTypes';

import { AddCircleOutline as AddCircleOutlineIcon, MoreVert as MoreVertIcon, StopRounded as StopRoundedIcon } from '@mui/icons-material';
import { Box, Button, Checkbox, FormControlLabel, Grid, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { useCallback, useState } from 'react';

import useTranslation from '../../../../../extension-ui/src/hooks/useTranslation';
import { Progress } from '../../../components';
import PoolInfo from './PoolMoreInfo';

interface Props {
  chain: Chain;
  api: ApiPromise | undefined;
  pool: MyPoolInfo | undefined;
}

export default function Pool({ api, chain, pool }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [info, setInfo] = useState(undefined);
  const [showPoolInfo, setShowPoolInfo] = useState(false);

  const points = api.createType('Balance', pool?.bondedPools?.points ?? 0)

  const handleMorePoolInfoOpen = useCallback((i) => {
    setInfo(i);
    setShowPoolInfo(true);
  }, []);

  const handleMorePoolInfoClose = useCallback((i) => {
    setInfo(undefined);
    setShowPoolInfo(false);
  }, []);

  return (
    <Grid container sx={{ p: 0 }}>
      {pool !== undefined && api
        ? pool
          ? <>
            <Paper elevation={2} sx={{ backgroundColor: grey[600], borderRadius: '5px', color: 'white', p: '5px 0px 5px 10px', width: '100%' }}>
              <Grid alignItems='center' container id='header' sx={{ fontSize: 11 }}>
                <Grid item sx={{ textAlign: 'center' }} xs={1}>
                  {t('More')}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={1}>
                  {t('Index')}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={4}>
                  {t('Name')}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={1}>
                  {t('State')}
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={2}>
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

            <Paper elevation={2} sx={{ backgroundColor: grey[100], mt: '4px', p: '1px 0px 2px 10px', width: '100%' }}>
              <Grid alignItems='center' container sx={{ fontSize: 12 }}>

                <Grid alignItems='center' item sx={{ textAlign: 'center' }} xs={1}>
                  <MoreVertIcon fontSize='small' onClick={() => handleMorePoolInfoOpen(p)} sx={{ cursor: 'pointer' }} />
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={1}>
                  {pool.poolId.toNumber()}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={4}>
                  {pool.metadata ?? t('no name')}
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={1}>
                  {pool.bondedPools.state}
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={2}>
                  {points?.toHuman()}
                </Grid>
                <Grid item sx={{ textAlign: 'center' }} xs={2}>
                  {pool.bondedPools.memberCounter}
                </Grid>
                <Grid item justifyContent='center' sx={{ textAlign: 'center' }} xs={1}>
                  <StopRoundedIcon color='warning' fontSize='small' sx={{ cursor: 'pointer' }} />
                </Grid>
              </Grid>
            </Paper>
          </>
          : <Grid item sx={{ fontSize: 12, textAlign: 'center', pt: 7 }} xs={12}>
            {t('No active pool found')}
          </Grid>
        : <Progress title={t('Loading pool ....')} />
      }
      {/* {showPoolInfo && info &&
         <PoolInfo
           api={api}
           chain={chain}
           handleMorePoolInfoClose={handleMorePoolInfoClose}
           info={info}
           showPoolInfo={showPoolInfo}
         />
       } */}
    </Grid>
  );
}
