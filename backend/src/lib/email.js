import { render } from '@react-email/render';
import { 
  Html, 
  Head, 
  Body, 
  Container, 
  Section, 
  Heading, 
  Text, 
  Link, 
  Hr, 
  Button,
  Tailwind
} from '@react-email/components';
import { sendInvite } from './emailService.js';
import React from 'react';

const EMAIL_FROM = 'GMRIT CodeSphere <admin@mail.codesphere.com>';

// Use React.createElement to avoid needing a JSX transpiler in the backend
const InvitationTemplate = (props) => {
  const { 
    candidateName, 
    interviewerName, 
    problemTitle, 
    scheduledAt, 
    duration, 
    interviewerLink, 
    candidateLink,
    role 
  } = props;
  
  const link = role === 'interviewer' ? interviewerLink : candidateLink;
  
  return React.createElement(Html, null, 
    React.createElement(Head),
    React.createElement(Tailwind, null,
      React.createElement(Body, { className: "bg-white my-auto mx-auto font-sans" },
        React.createElement(Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
          React.createElement(Section, { className: "mt-[32px]" },
            React.createElement(Heading, { className: "text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0" },
              "Interview Invitation"
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              `Hello ${role === 'interviewer' ? interviewerName : candidateName},`
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              "An interview has been scheduled on the ", React.createElement("strong", null, "GMRIT CodeSphere"), " platform."
            ),
            React.createElement(Section, { className: "bg-[#f9f9f9] rounded p-[16px] my-[16px]" },
              React.createElement(Text, { className: "text-black text-[14px] leading-[22px] m-0" },
                React.createElement("strong", null, "Date: "), new Date(scheduledAt).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
              ),
              React.createElement(Text, { className: "text-black text-[14px] leading-[22px] m-0" },
                React.createElement("strong", null, "Duration: "), `${duration} mins`
              )
            ),
            
            // Rules & Conditions Section
            React.createElement(Section, { className: "border border-solid border-red-100 bg-red-50/30 rounded p-[16px] my-[24px]" },
              React.createElement(Heading, { className: "text-red-700 text-[14px] font-bold uppercase tracking-wider mt-0 mb-3" },
                "Security Policy & Interview Guidelines"
              ),
              React.createElement("ul", { style: { margin: 0, paddingLeft: '20px', color: '#444', fontSize: '13px', lineHeight: '20px' } },
                React.createElement("li", null, "Entry is permitted only from a Desktop or Laptop device."),
                React.createElement("li", null, "Mandatory Fullscreen Mode will be enabled during the session."),
                React.createElement("li", null, "Strict monitoring of tab-switching and screen-activity is active."),
                React.createElement("li", null, React.createElement("strong", { style: { color: '#b91c1c' } }, "Three (3) security violations"), " will result in automatic session termination."),
                React.createElement("li", null, "Unauthorized help or use of external AI is strictly prohibited.")
              )
            ),

            React.createElement(Section, { className: "text-center mt-[32px] mb-[32px]" },
              React.createElement(Button, {
                className: "bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3",
                href: link
              }, `Join Session as ${role === 'interviewer' ? 'Interviewer' : 'Candidate'}`)
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              "Or join using this link: ",
              React.createElement(Link, { href: link, className: "text-[#0664ff] no-underline" }, link)
            ),
            React.createElement(Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
            React.createElement(Text, { className: "text-[#666666] text-[12px] leading-[24px]" },
              "GMRIT CodeSphere Admin Team"
            )
          )
        )
      )
    )
  );
};

const CancellationTemplate = (props) => {
  const { candidateName, interviewerName, problemTitle, scheduledAt, role } = props;
  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Tailwind, null,
      React.createElement(Body, { className: "bg-white my-auto mx-auto font-sans" },
        React.createElement(Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px] border-red-100" },
          React.createElement(Section, { className: "mt-[32px]" },
            React.createElement(Heading, { className: "text-red-600 text-[24px] font-normal text-center p-0 my-[30px] mx-0" },
              "Interview Cancelled"
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
               `Hello ${role === 'interviewer' ? interviewerName : candidateName},`
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              "The upcoming interview session has been cancelled."
            ),
            React.createElement(Section, { className: "bg-red-50 text-red-700 rounded p-[16px] my-[16px] border border-red-100 border-solid" },
              React.createElement(Text, { className: "text-[14px] leading-[22px] m-0 font-medium" },
                `Scheduled At: ${new Date(scheduledAt).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`
              )
            ),
            React.createElement(Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
            React.createElement(Text, { className: "text-[#666666] text-[12px] font-bold" },
              "GMRIT Admin"
            )
          )
        )
      )
    )
  );
};

const RoleChangeTemplate = (props) => {
  const { userName, roleType, action } = props;
  const isPromotion = action === 'promoted';
  
  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Tailwind, null,
      React.createElement(Body, { className: "bg-white my-auto mx-auto font-sans" },
        React.createElement(Container, { className: `border border-solid rounded my-[40px] mx-auto p-[20px] w-[465px] ${isPromotion ? 'border-emerald-100' : 'border-neutral-200'}` },
          React.createElement(Section, { className: "mt-[32px]" },
            React.createElement(Heading, { className: `${isPromotion ? 'text-emerald-600' : 'text-neutral-600'} text-[24px] font-normal text-center p-0 my-[30px] mx-0` },
              isPromotion ? "Account Promoted" : "Role Updated"
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
               `Hello ${userName},`
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              isPromotion 
                ? `Congratulations! Your account on the GMRIT CodeSphere platform has been officially upgraded to an Interviewer role.`
                : `Your account on the GMRIT CodeSphere platform has been transitioned back to a Candidate role.`
            ),
            React.createElement(Section, { className: `${isPromotion ? 'bg-emerald-50 text-emerald-800' : 'bg-neutral-50 text-neutral-800'} rounded p-[16px] my-[16px] border ${isPromotion ? 'border-emerald-100' : 'border-neutral-200'} border-solid` },
              React.createElement(Text, { className: "text-[14px] leading-[22px] m-0 font-medium text-center" },
                `Current Access Level: ${roleType}`
              )
            ),
            React.createElement(Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
            React.createElement(Text, { className: "text-[#666666] text-[12px] font-bold" },
              "GMRIT Admin"
            )
          )
        )
      )
    )
  );
};

export const sendInterviewInvite = async (params) => {
  const interviewerHtml = await render(React.createElement(InvitationTemplate, { ...params, role: 'interviewer' }));
  const candidateHtml = await render(React.createElement(InvitationTemplate, { ...params, role: 'candidate' }));

  return await sendInvite({ 
    to: params.interviewerEmail, 
    subject: "Interview Invitation", 
    html: interviewerHtml,
    from: EMAIL_FROM
  }).then(() => sendInvite({ 
    to: params.candidateEmail, 
    subject: "Interview Invitation", 
    html: candidateHtml,
    from: EMAIL_FROM 
  }));
};

export const sendCancellationNotice = async (params) => {
  const interviewerHtml = await render(React.createElement(CancellationTemplate, { ...params, role: 'interviewer' }));
  const candidateHtml = await render(React.createElement(CancellationTemplate, { ...params, role: 'candidate' }));

  return await sendInvite({ 
    to: params.interviewerEmail, 
    subject: "CANCELLED: Interview Invitation", 
    html: interviewerHtml,
    from: EMAIL_FROM
  }).then(() => sendInvite({ 
    to: params.candidateEmail, 
    subject: "CANCELLED: Interview Invitation", 
    html: candidateHtml,
    from: EMAIL_FROM
  }));
};

const OTPTemplate = (props) => {
  const { userName, otpCode } = props;
  
  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Tailwind, null,
      React.createElement(Body, { className: "bg-white my-auto mx-auto font-sans" },
        React.createElement(Container, { className: "border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]" },
          React.createElement(Section, { className: "mt-[32px]" },
            React.createElement(Heading, { className: "text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0" },
              "Verification Code"
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
               `Hello ${userName},`
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              "To join your interview session safely, please use the 6-digit verification code below. This code is valid for 10 minutes."
            ),
            React.createElement(Section, { className: "bg-[#f9f9f9] rounded p-[24px] my-[24px] text-center" },
              React.createElement(Text, { className: "text-black text-[32px] font-bold tracking-[10px] m-0" },
                otpCode
              )
            ),
            React.createElement(Text, { className: "text-[#666666] text-[12px] leading-[20px]" },
              "If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake."
            ),
            React.createElement(Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
            React.createElement(Text, { className: "text-[#666666] text-[12px] font-bold" },
              "GMRIT CodeSphere Security"
            )
          )
        )
      )
    )
  );
};

export const sendRoleNotice = async (params) => {
  const html = await render(React.createElement(RoleChangeTemplate, params));
  
  return await sendInvite({ 
    to: params.userEmail, 
    subject: `CodeSphere Account Update: You are now a ${params.roleType}`, 
    html: html,
    from: EMAIL_FROM
  });
};

export const sendEmailOtp = async (params) => {
  const html = await render(React.createElement(OTPTemplate, params));
  
  return await sendInvite({
    to: params.userEmail,
    subject: `Your Verification Code: ${params.otpCode}`,
    html: html,
    from: EMAIL_FROM
  });
};
const SecurityTerminationTemplate = (props) => {
  const { candidateName, interviewerName, reason, role } = props;
  const isCandidate = role === 'candidate';

  return React.createElement(Html, null,
    React.createElement(Head),
    React.createElement(Tailwind, null,
      React.createElement(Body, { className: "bg-white my-auto mx-auto font-sans" },
        React.createElement(Container, { className: "border border-solid border-red-200 rounded my-[40px] mx-auto p-[20px] w-[465px]" },
          React.createElement(Section, { className: "mt-[32px]" },
            React.createElement(Heading, { className: "text-red-700 text-[24px] font-bold text-center p-0 my-[30px] mx-0 uppercase tracking-tighter" },
              "Security Termination"
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
               `Hello ${isCandidate ? candidateName : interviewerName},`
            ),
            React.createElement(Text, { className: "text-black text-[14px] leading-[24px]" },
              isCandidate 
                ? "Your interview session has been automatically terminated due to multiple security violations (exiting fullscreen mode or switching tabs)."
                : `The interview session with ${candidateName} has been automatically terminated due to multiple security violations on the candidate's side.`
            ),
            React.createElement(Section, { className: "bg-red-50 text-red-800 rounded p-[16px] my-[16px] border border-red-200 border-solid" },
              React.createElement(Text, { className: "text-[13px] leading-[20px] m-0" },
                React.createElement("strong", null, "Reason: "), reason
              )
            ),
            React.createElement(Text, { className: "text-[#666666] text-[12px] leading-[20px]" },
              isCandidate 
                ? "This incident has been logged and reported to the placement cell. Please contact the administrator if you believe this was a technical error."
                : "You may now provide any additional notes in the platform dashboard. The placement cell has been notified of this automatic termination."
            ),
            React.createElement(Hr, { className: "border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" }),
            React.createElement(Text, { className: "text-red-600 text-[12px] font-bold" },
              "GMRIT CodeSphere Security Team"
            )
          )
        )
      )
    )
  );
};

export const sendSecurityTerminationNotice = async (params) => {
  const interviewerHtml = await render(React.createElement(SecurityTerminationTemplate, { ...params, role: 'interviewer' }));
  const candidateHtml = await render(React.createElement(SecurityTerminationTemplate, { ...params, role: 'candidate' }));

  return await sendInvite({
    to: params.interviewerEmail,
    subject: "URGENT: Interview Terminated due to Security Violations",
    html: interviewerHtml,
    from: EMAIL_FROM
  }).then(() => sendInvite({
    to: params.candidateEmail,
    subject: "TERMINATED: Security Violation Policy Breach",
    html: candidateHtml,
    from: EMAIL_FROM
  }));
};
