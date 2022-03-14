// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { CheckCircleRounded as CheckCircleRoundedIcon, Email as EmailIcon, LaunchRounded as LaunchRoundedIcon, RemoveCircleRounded as RemoveCircleRoundedIcon, Twitter as TwitterIcon } from '@mui/icons-material';
import { Grid, Link, Skeleton } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

import Identicon from '@polkadot/react-identicon';

import { Chain } from '../../../extension-chains/src/types';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { ShortAddress } from '.';
import Hint from './Hint';

interface Props {
  accountInfo: DeriveAccountInfo;
  chain: Chain;
  iconSize?: number;
  showAddress?: boolean;
  title?: string;
  totalStaked?: string;
}

export default function Identity({ accountInfo, chain, iconSize = 24, showAddress = false, title = '', totalStaked = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const hasIcons = accountInfo?.identity.twitter || accountInfo?.identity.web || accountInfo?.identity.email;

  // to check if the account has a judgement to set a verified green tick
  const judgement = accountInfo?.identity?.judgements && JSON.stringify(accountInfo?.identity?.judgements).match(/reasonable|knownGood/gi);

  return (
    <>
      <Grid container>
        {title &&
          <Grid item sx={{ paddingBottom: '5px' }}>
            {title}
          </Grid>
        }

        {accountInfo
          ? <Grid alignItems='center' container item justifyContent='flex-start' xs={12}>
            <Grid item xs={1}>
              {accountInfo?.accountId &&
                <Identicon
                  prefix={chain?.ss58Format ?? 42}
                  size={iconSize}
                  theme={chain?.icon || 'polkadot'}
                  value={String(accountInfo?.accountId)}
                />}
            </Grid>

            <Grid alignItems='center' container item sx={{ paddingLeft: '5px' }} xs={11}>
              <Grid alignItems='center' container item justifyContent='flex-start' spacing={0.3} xs={12}>
                <Grid container item sx={{ flexWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} xs={hasIcons ? 9 : 12}>
                  <Grid item sx={{ pr: '5px' }}>
                    {judgement
                      ? <Hint id='judgement' tip={judgement}><CheckCircleRoundedIcon color='success' sx={{ fontSize: 15 }} /></Hint>
                      : <Hint id='noJudgement' tip={judgement}><RemoveCircleRoundedIcon color='disabled' sx={{ fontSize: 15 }} /></Hint>
                    }
                  </Grid>
                  {accountInfo?.identity.displayParent &&
                    <Grid item sx={{ textOverflow: 'ellipsis' }}>
                      {accountInfo?.identity.displayParent} /
                    </Grid>
                  }
                  {accountInfo?.identity.display &&
                    <Grid item sx={accountInfo?.identity.displayParent && { color: grey[500], textOverflow: 'ellipsis' }}>
                      {accountInfo?.identity.display} { }
                    </Grid>
                  }
                  {!(accountInfo?.identity.displayParent || accountInfo?.identity.display) &&
                    <Grid item sx={{ textAlign: 'letf' }}>
                      {accountInfo?.accountId && <ShortAddress address={String(accountInfo?.accountId)} />}
                    </Grid>
                  }

                </Grid>

                <Grid container item justifyContent='flex-start' xs={hasIcons ? 3 : 0} >
                  {accountInfo?.identity.twitter &&
                    <Grid item>
                      <Link href={`https://TwitterIcon.com/${accountInfo?.identity.twitter}`}>
                        <TwitterIcon
                          color='primary'
                          sx={{ fontSize: 15 }}
                        />
                      </Link>
                    </Grid>
                  }
                  {accountInfo?.identity.email &&
                    <Grid item>
                      <Link href={`mailto:${accountInfo?.identity.email}`}>
                        <EmailIcon
                          color='secondary'
                          sx={{ fontSize: 15 }}
                        />
                      </Link>
                    </Grid>
                  }
                  {accountInfo?.identity.web &&
                    <Grid item>
                      <Link
                        href={accountInfo?.identity.web}
                        rel='noreferrer'
                        target='_blank'
                      >
                        <LaunchRoundedIcon
                          color='primary'
                          sx={{ fontSize: 15 }}
                        />
                      </Link>
                    </Grid>
                  }
                </Grid>
              </Grid>
              <Grid alignItems='center' container item justifyContent='flex-start' sx={{ paddingLeft: '18px' }} xs={12}>
                {showAddress &&
                  <Grid item sx={{ color: grey[500], textAlign: 'left' }} xs={12}>
                    {String(accountInfo?.accountId)}
                  </Grid>
                }
                {totalStaked &&
                  <Grid item sx={{ color: grey[500], fontSize: 11, lineHeight: '10px', textAlign: 'left' }} xs={12}>
                    {totalStaked}
                  </Grid>
                }
              </Grid>
            </Grid>
          </Grid>
          : <Skeleton sx={{ fontWeight: 'bold', lineHeight: '16px', width: '80%' }} />
        }
      </Grid>
    </>
  );
}
