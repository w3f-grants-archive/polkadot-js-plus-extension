// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 *  this component shows a validator's info in a page including its nominators listand a link to subscan 
 * */

import { BubbleChart as BubbleChartIcon } from '@mui/icons-material';
import { Avatar, Container, Divider, Grid, Link, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { Dispatch, SetStateAction, useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import Identicon from '@polkadot/react-identicon';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { PlusHeader, Popup, ShortAddress } from '../../components';
import Identity from '../../components/Identity';
import { SELECTED_COLOR } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { AccountsBalanceType } from '../../util/plusTypes';
import { amountToHuman } from '../../util/plusUtils';

interface Props {
  chain: Chain;
  api: ApiPromise | undefined;
  showValidatorInfoModal: boolean;
  setShowValidatorInfoModal: Dispatch<SetStateAction<boolean>>;
  info: DeriveStakingQuery;
  validatorsIdentities: DeriveAccountInfo[] | null;
  staker?: AccountsBalanceType;
}

export default function ValidatorInfo({ api, chain, info, setShowValidatorInfoModal, showValidatorInfoModal, staker, validatorsIdentities }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const accountInfo = validatorsIdentities?.find((v) => v.accountId === info?.accountId);
  const chainName = chain?.name.replace(' Relay Chain', '');

  const decimals = api && api.registry.chainDecimals[0];
  const token = api && api.registry.chainTokens[0];

  const handleDetailsModalClose = useCallback(
    (): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setShowValidatorInfoModal(false);
    }, [setShowValidatorInfoModal]);

  const sortedNominators = info?.exposure?.others.sort((a, b) => b.value - a.value);
  const myIndex = sortedNominators.findIndex((n) => n.who.toString() === staker.address);

  return (
    <Popup handleClose={handleDetailsModalClose} id='scrollArea' showModal={showValidatorInfoModal}>
      <PlusHeader action={handleDetailsModalClose} chain={chain} closeText={'Close'} icon={<BubbleChartIcon fontSize='small' />} title={'Validator Info'} />
      <Container sx={{ p: '0px 20px' }}>
        <Grid item sx={{ p: 1 }} xs={12}>
          <Paper elevation={3}>
            <Grid container item justifyContent='flex-start' sx={{ fontSize: 12, textAlign: 'center', p: '20px 10px 20px' }}>
              <Grid item sx={{ height: '40px' }} xs={11}>
                {accountInfo && <Identity accountInfo={accountInfo} chain={chain} iconSize={40} showAddress={true} />}
              </Grid>
              <Grid item sx={{ pr: 3, pt: 1 }} xs={1}>
                <Link
                  href={`https://${chainName}.subscan.io/account/${info?.accountId}`}
                  rel='noreferrer'
                  target='_blank'
                  underline='none'
                >
                  <Avatar
                    alt={'subscan'}
                    src={getLogo('subscan')}
                    sx={{ height: 18, width: 18 }}
                  />
                </Link>
              </Grid>
              <Grid item sx={{ p: '10px 0px 20px' }} xs={12}>
                <Divider />
              </Grid>
              <Grid item sx={{ pl: 3, textAlign: 'left' }} xs={6}>
                {t('Own')}{': '}{Number(info?.exposure.own || info?.stakingLedger.active).toLocaleString()} {' '}{token}
              </Grid>
              <Grid item sx={{ pr: 3, textAlign: 'right' }} xs={6}>
                {t('Total')}{': '}{Number(info?.exposure.total).toLocaleString()}{' '}{token}
              </Grid>
              <Grid item sx={{ pl: 3, pt: 1, textAlign: 'left' }} xs={6}>
                {t('Commission')}{': '}   {info.validatorPrefs.commission === 1 ? 0 : info.validatorPrefs.commission / (10 ** 7)}%
              </Grid>
              {myIndex !== -1 &&
                <Grid item sx={{ pr: 3, pt: 1, textAlign: 'right' }} xs={6}>
                  {t('Your rank')}{': '}{myIndex + 1}
                </Grid>
              }
            </Grid>
          </Paper>
        </Grid>
        <Grid container item justifyContent='center' spacing={1} xs={12}>
          <Grid item sx={{ color: grey[600], textAlign: 'center', fontFamily: 'fantasy', fontSize: 15, padding: '10px 0px 5px' }}>
            {t('Nominators')}
          </Grid>
          <Grid item sx={{ fontSize: 12 }}>
            ({info?.exposure?.others?.length})
          </Grid>
        </Grid>
        <Grid item sx={{ bgcolor: 'background.paper', height: '300px', overflowY: 'auto', scrollbarWidth: 'none', width: '100%', p: 2 }} xs={12}>
          {sortedNominators.map(({ value, who }, index) => (
            <Paper elevation={2} key={index} sx={{ bgcolor: index === myIndex && SELECTED_COLOR, my: 1, p: '5px' }}>
              <Grid alignItems='center' container item justifyContent='space-between' sx={{ fontSize: 12 }}>
                <Grid item xs={1}>
                  <Identicon
                    prefix={chain?.ss58Format ?? 42}
                    size={30}
                    theme={chain?.icon || 'polkadot'}
                    value={who}
                  />
                </Grid>
                <Grid item sx={{ textAlign: 'left' }} xs={6}>
                  <ShortAddress address={who} charsCount={8} fontSize={12} />
                </Grid>
                <Grid item sx={{ textAlign: 'right' }} xs={5}>
                  {Number(amountToHuman(value, decimals)).toLocaleString()} {' '}{token}
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Grid>
      </Container>
    </Popup>
  );
}
