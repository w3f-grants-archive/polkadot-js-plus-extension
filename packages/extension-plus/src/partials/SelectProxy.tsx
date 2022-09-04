// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable header/header */

/**
 * @description
 *  this component provides a place to select a suitable Proxy account to continue
 * */

import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { AccountJson, AccountWithChildren } from '../../../extension-base/src/background/types';

import { SendOutlined as SendOutlinedIcon } from '@mui/icons-material';
import { Container, FormControlLabel, Grid, Radio, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React, { Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { NextStepButton } from '@polkadot/extension-ui/components';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Chain } from '../../../extension-chains/src/types';
import { AccountContext, SettingsContext } from '../../../extension-ui/src/components/contexts';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import { DEFAULT_TYPE } from '../../../extension-ui/src/util/defaultType';
import { PlusHeader, Popup, Progress, ShortAddress } from '../components';
import { NameAddress, Proxy, ProxyTypes, Recoded } from '../util/plusTypes';

interface Props {
  api: ApiPromise | undefined;
  selectProxyModalOpen: boolean;
  chain: Chain;
  setProxy: React.Dispatch<React.SetStateAction<AccountJson | undefined>>
  setSelectProxyModalOpen: Dispatch<SetStateAction<boolean>>;
  realAddress: string;
  allAddresesOnSameChain?: { formattedAddress: string, account: AccountJson }[];
  setActionModalOpen: Dispatch<SetStateAction<boolean>>;
  acceptableTypes: ProxyTypes[];
  icon: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}

/** find an account in our list */
function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | null {
  return accounts.find(({ address }): boolean =>
    address === _address
  ) || null;
}

function findSubstrateAccount(accounts: AccountJson[], publicKey: Uint8Array): AccountJson | null {
  const pkStr = publicKey.toString();

  return accounts.find(({ address }): boolean =>
    decodeAddress(address).toString() === pkStr
  ) || null;
}

export default function SelectProxy({ acceptableTypes, allAddresesOnSameChain, api, chain, icon, realAddress, selectProxyModalOpen, setProxy, setSelectProxyModalOpen, setActionModalOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const settings = useContext(SettingsContext);

  const [proxies, setProxies] = useState<Proxy[] | undefined>();
  const [selectedOption, setSelectedOption] = useState<number | undefined>();

  const recodeAddress = useCallback((address: string, accounts: AccountWithChildren[], settings: SettingsStruct, chain?: Chain | null): Recoded => {
    /** decode and create a shortcut for the encoded address */
    const publicKey = decodeAddress(address);

    /** find our account using the actual publicKey, and then find the associated chain */
    const account = findSubstrateAccount(accounts, publicKey);
    const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

    /** always allow the actual settings to override the display */
    return {
      account,
      formatted: encodeAddress(publicKey, prefix),
      genesisHash: account?.genesisHash,
      prefix,
      type: account?.type || DEFAULT_TYPE
    };
  }, []);

  const allAddreses = useMemo(() => {
    if (allAddresesOnSameChain) { return allAddresesOnSameChain; }

    const all = accounts.map((acc): { account: AccountJson, formattedAddress: string } => {
      const accountByAddress = findAccountByAddress(accounts, acc.address);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const recoded = (chain?.definition.chainType === 'ethereum' ||
        accountByAddress?.type === 'ethereum' ||
        (!accountByAddress))
        ? { account: accountByAddress, formatted: acc.addres, type: 'ethereum' } as Recoded
        : recodeAddress(acc.address, accounts, settings, chain);

      return {
        account: acc,
        formattedAddress: String(recoded.formatted)
      };
    });

    return all.filter((a) => a.formattedAddress !== (realAddress));
  }, [allAddresesOnSameChain, accounts, chain, recodeAddress, settings, realAddress]);

  useEffect(() => {
    realAddress && api && api.query.proxy?.proxies(realAddress).then((proxies) => setProxies(JSON.parse(JSON.stringify(proxies[0]))));
  }, [api, chain, realAddress]);

  const isAvailable = useCallback((address: string): NameAddress => allAddreses?.find((a) => a.formattedAddress === address), [allAddreses]);

  const handleSelectProxyModalClose = useCallback((): void => {
    setSelectProxyModalOpen(false);
    setActionModalOpen(false);
  }, [setSelectProxyModalOpen, setActionModalOpen]);

  const handleOptionChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(Number(event.target.value));
  }, []);

  const handleSetProxy = useCallback(() => {
    selectedOption && proxies && setProxy(proxies[selectedOption]);
    setSelectProxyModalOpen(false);
  }, [proxies, selectedOption, setProxy, setSelectProxyModalOpen]);

  return (
    <Popup handleClose={handleSelectProxyModalClose} showModal={selectProxyModalOpen}>
      <PlusHeader action={handleSelectProxyModalClose} chain={chain} closeText={'Close'} icon={icon} title={t('Select Proxy')} />
      <Container sx={{ pt: '30px' }}>
        <Grid item sx={{ mb: '40px' }}>
          <Typography variant='subtitle2'>
            {t('Since this is a real address (can not sign transactions), hence, you need to select an appropriate proxy of the account to do transaction on behalf')}
          </Typography>
        </Grid>
        <Grid container item sx={{ fontSize: 14, fontWeight: 500, bgcolor: grey[200], borderRadius: '5px', py: '5px', px: '10px' }}>
          <Grid item xs={3}>
            {t('address')}
          </Grid>
          <Grid item xs={3}>
            {t('type')}
          </Grid>
          <Grid item xs={2}>
            {t('delay')}
          </Grid>
          <Grid item xs={3}>
            {t('available')}
          </Grid>
          <Grid item xs={1}>
            {t('select')}
          </Grid>
        </Grid>
        <Grid alignItems='flex-start' container item sx={{ borderLeft: '2px solid', borderRight: '2px solid', borderBottom: '2px solid', borderBottomLeftRadius: '30px 10%', borderColor: grey[200], display: 'inline-table', pt: '15px', pl: '10px', height: 300, overflowY: 'auto' }} xs={12}>
          {chain && realAddress &&
            <>
              {proxies
                ? proxies.length
                  ? proxies.map((proxy, index) => {
                    const localAccount = isAvailable(proxy.delegate)?.account;

                    return (
                      <Grid alignItems='center' container item key={index} sx={{ fontSize: 12 }}>
                        <Grid item xs={3}>
                          <ShortAddress address={proxy.delegate} fontSize={12} />
                        </Grid>
                        <Grid item xs={3}>
                          {proxy.proxyType}
                        </Grid>
                        <Grid item xs={2}>
                          {proxy.delay}
                        </Grid>
                        <Grid item xs={3} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {!!localAccount ? `Yes (${localAccount.name})` : 'No'}
                        </Grid>
                        <Grid item xs={1}>
                          <FormControlLabel
                            control={
                              <Radio
                                checked={selectedOption === index}
                                disabled={!localAccount || !acceptableTypes.includes(proxy.proxyType)}
                                onChange={handleOptionChange}
                                size='small'
                                value={index} />
                            }
                            label='' value={index} />
                        </Grid>
                      </Grid>
                    )
                  })
                  : <Grid item pt='10px'>
                    {t('No proxies found for the entered real account on {{chain}}', { replace: { chain: chain?.name } })}
                  </Grid>
                : <Progress pt={'30px'} title={'Loading proxies ...'} />
              }
            </>}
        </Grid>
        <Grid item sx={{ pt: '30px' }} xs={12}>
          <NextStepButton
            data-button-action='OK'
            isDisabled={!realAddress || !selectedOption}
            onClick={handleSetProxy}
          >
            {t('Next')}
          </NextStepButton>
        </Grid>
      </Container>
    </Popup>
  );
}
