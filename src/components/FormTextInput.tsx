/**
 * Copyright 2019 Ironbelly Devs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { Component } from 'react'
import styled from 'styled-components/native'
import ReactNative, {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  TextInputIOSProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputSubmitEditingEventData,
} from 'react-native'
import { TextInput, Text } from 'src/components/CustomFont'
type Props = {
  units?: string
  placeholder?: string
  testID?: string
  title?: string
  maxLength?: number
  value: string
  onChange: (value: string) => void
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void
  autoFocus: boolean
  secureTextEntry?: boolean
  textContentType?: TextInputIOSProps['textContentType']
  keyboardType?: KeyboardTypeOptions
  autoCorrect?: boolean
  getRef?: (instance: ReactNative.TextInput | null) => void
  returnKeyType?: ReturnKeyTypeOptions
  onSubmitEditing?: (
    e: NativeSyntheticEvent<TextInputSubmitEditingEventData>,
  ) => void
  multiline?: boolean
  readonly?: boolean
}
const Layout = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`
const StyledInput = styled(TextInput)`
  margin-left: -20;
  padding: 20px;
  margin-right: -20;
  background-color: #fbfbfb;
  font-size: 18;
  font-weight: 400;
  flex-grow: 1;
`
const Title = styled(Text)`
  font-weight: bold;
  font-size: 16;
  margin-bottom: 4;
`
export default class FormTextInput extends Component<Props> {
  render() {
    const {
      maxLength,
      onChange,
      onFocus,
      onBlur,
      value,
      autoFocus,
      placeholder,
      title,
      secureTextEntry,
      testID,
      textContentType,
      autoCorrect,
      keyboardType,
      returnKeyType,
      getRef,
      onSubmitEditing,
      multiline,
    } = this.props
    return (
      <React.Fragment>
        {title && <Title>{title}</Title>}
        <Layout>
          <StyledInput
            selectionColor={'#ABABAB'}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            autoFocus={autoFocus}
            onChangeText={onChange}
            ref={getRef}
            value={value}
            maxLength={maxLength}
            placeholder={placeholder}
            testID={testID}
            keyboardType={keyboardType ?? 'default'}
            textContentType={textContentType ?? 'none'}
            autoCorrect={autoCorrect}
            returnKeyType={returnKeyType ?? 'default'}
            onSubmitEditing={onSubmitEditing}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </Layout>
      </React.Fragment>
    )
  }
}
